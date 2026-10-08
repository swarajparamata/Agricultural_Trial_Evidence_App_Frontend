import { z } from 'zod';
import { API_PREFIX, TOKEN_STORAGE_KEY } from '@/constants';
import {
  AgentGraphSchema,
  AppMetaSchema,
  AppSettingsSchema,
  AssistantStatusSchema,
  AuditEventSchema,
  ChatStreamEventSchema,
  DeletedTrialSchema,
  ImportResponseSchema,
  LlmTestResultSchema,
  RebuildResultSchema,
  SettingsUpdateResponseSchema,
  SourceContentSchema,
  SourceFileSchema,
  TokenResponseSchema,
  TrialDetailSchema,
  TrialListSchema,
  TrialSchema,
  UserAccountSchema,
  type AppSettings,
  type AuthCredentials,
  type ChatStreamEvent,
  type Role,
  type SettingsSectionName,
  type TrialInput,
  type TrialUpdateInput,
} from '@/types';
import { getApiBaseUrl } from '../env';

/** A failed API call. `fieldErrors` maps a field path (e.g. "custom_fields.soil_type") to its message. */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// Storage can be blocked (e.g. some private windows); the session then lasts until the page is closed.
let memoryToken: string | null = null;

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY) ?? memoryToken;
    } catch {
      return memoryToken;
    }
  },
  set(token: string) {
    memoryToken = token;
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {
      // Keep the token in memory only.
    }
  },
  clear() {
    memoryToken = null;
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // Nothing stored.
    }
  },
};

const unauthorizedListeners = new Set<() => void>();

/** Runs `listener` when the API rejects the stored token (expired or revoked session). */
export const onUnauthorized = (listener: () => void): (() => void) => {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
};

const ValidationItemSchema = z.object({
  loc: z.array(z.union([z.string(), z.number()])).optional(),
  msg: z.string(),
});

const ErrorBodySchema = z.object({ detail: z.union([z.string(), z.array(ValidationItemSchema)]) });

/** FastAPI errors carry `detail` as a message or as a list of validation errors. */
const toApiError = (status: number, body: unknown): ApiError => {
  const parsed = ErrorBodySchema.safeParse(body);
  if (!parsed.success) return new ApiError(`The server answered with HTTP ${status}.`, status);
  const { detail } = parsed.data;
  if (typeof detail === 'string') return new ApiError(detail, status);

  const fieldErrors: Record<string, string> = {};
  const messages: string[] = [];
  for (const item of detail) {
    const path = (item.loc ?? []).filter((part) => part !== 'body').join('.');
    const message = item.msg.replace(/^Value error, /, '');
    if (path && !(path in fieldErrors)) fieldErrors[path] = message;
    messages.push(message);
  }
  return new ApiError([...new Set(messages)].join(' ') || 'The request was not valid.', status, fieldErrors);
};

const unreachable = () =>
  new ApiError(`Can't reach the AgriEvidence API at ${getApiBaseUrl()}. Is the backend running?`, 0);

const isAbortError = (error: unknown) => error instanceof DOMException && error.name === 'AbortError';

interface RequestOptions<T> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  form?: FormData;
  schema?: z.ZodType<T>;
  signal?: AbortSignal;
}

const send = async (path: string, init: RequestInit): Promise<Response> => {
  const token = tokenStore.get();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  try {
    const response = await fetch(`${getApiBaseUrl()}${API_PREFIX}${path}`, { ...init, headers });
    if (response.status === 401 && token) unauthorizedListeners.forEach((listener) => listener());
    return response;
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw unreachable();
  }
};

/** Calls the backend and validates the response with `schema`; throws `ApiError` on failure. */
export const apiRequest = async <T>(path: string, options: RequestOptions<T> = {}): Promise<T> => {
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;
  if (options.form) {
    body = options.form;
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  const response = await send(path, {
    method: options.method ?? (body === undefined ? 'GET' : 'POST'),
    headers,
    body,
    signal: options.signal,
  });
  if (response.status === 204) return undefined as T;
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) throw toApiError(response.status, data);
  if (!options.schema) return data as T;

  const parsed = options.schema.safeParse(data);
  if (!parsed.success) {
    console.error(`Unexpected response from ${path}:`, parsed.error);
    throw new ApiError('The server sent data in an unexpected format.', response.status);
  }
  return parsed.data;
};

const handleEventChunk = (chunk: string, onEvent: (event: ChatStreamEvent) => void) => {
  const data = chunk
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice('data:'.length).trim())
    .join('\n');
  if (!data) return;
  try {
    const parsed = ChatStreamEventSchema.safeParse(JSON.parse(data));
    if (parsed.success) onEvent(parsed.data);
  } catch {
    // Ignore a malformed event rather than abort the whole answer.
  }
};

/** Reads the server-sent events of a streaming endpoint and passes each one to `onEvent`. */
const streamEvents = async (
  path: string,
  body: unknown,
  onEvent: (event: ChatStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> => {
  const response = await send(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok || !response.body) {
    throw toApiError(response.status, await response.json().catch(() => null));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
    let boundary = buffer.indexOf('\n\n');
    while (boundary !== -1) {
      handleEventChunk(buffer.slice(0, boundary), onEvent);
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf('\n\n');
    }
  }
  if (buffer.trim()) handleEventChunk(buffer, onEvent);
};

const segment = (value: string) => encodeURIComponent(value);

export interface ChatHistoryTurn {
  role: 'user' | 'model';
  content: string;
}

/** Typed client for every backend endpoint the app uses. */
export const api = {
  meta: () => apiRequest('/meta', { schema: AppMetaSchema }),

  auth: {
    login: (credentials: AuthCredentials) =>
      apiRequest('/auth/login', { body: credentials, schema: TokenResponseSchema }),
    signup: (credentials: AuthCredentials & { full_name?: string }) =>
      apiRequest('/auth/signup', { body: credentials, schema: TokenResponseSchema }),
    me: () => apiRequest('/auth/me', { schema: UserAccountSchema }),
    updateProfile: (fullName: string) =>
      apiRequest('/auth/me', { method: 'PATCH', body: { full_name: fullName }, schema: UserAccountSchema }),
    changePassword: (currentPassword: string, newPassword: string) =>
      apiRequest<void>('/auth/change-password', {
        body: { current_password: currentPassword, new_password: newPassword },
      }),
  },

  trials: {
    list: async () => (await apiRequest('/trials', { schema: TrialListSchema })).items,
    get: (id: string) => apiRequest(`/trials/${segment(id)}`, { schema: TrialDetailSchema }),
    create: (input: TrialInput) => apiRequest('/trials', { body: input, schema: TrialSchema }),
    update: (id: string, input: TrialUpdateInput) =>
      apiRequest(`/trials/${segment(id)}`, { method: 'PATCH', body: input, schema: TrialSchema }),
    remove: (id: string) => apiRequest<void>(`/trials/${segment(id)}`, { method: 'DELETE' }),
    resolveConflict: (id: string, field: string, value: unknown, note: string) =>
      apiRequest(`/trials/${segment(id)}/conflicts/${segment(field)}/resolve`, {
        body: { value, note },
        schema: TrialSchema,
      }),
    revertField: (id: string, field: string) =>
      apiRequest(`/trials/${segment(id)}/overrides/${segment(field)}`, {
        method: 'DELETE',
        schema: TrialSchema,
      }),
    deleted: () => apiRequest('/trials/deleted', { schema: z.array(DeletedTrialSchema) }),
    restore: (id: string) =>
      apiRequest(`/trials/${segment(id)}/restore`, { method: 'POST', schema: TrialSchema }),
  },

  settings: {
    get: () => apiRequest('/settings', { schema: AppSettingsSchema }),
    update: <Section extends SettingsSectionName>(section: Section, value: AppSettings[Section]) =>
      apiRequest(`/settings/${section}`, {
        method: 'PUT',
        body: value,
        schema: SettingsUpdateResponseSchema,
      }),
    reset: (section: SettingsSectionName) =>
      apiRequest(`/settings/${section}/reset`, { method: 'POST', schema: SettingsUpdateResponseSchema }),
  },

  users: {
    list: () => apiRequest('/users', { schema: z.array(UserAccountSchema) }),
    create: (input: { email: string; full_name: string; password: string; role: Role }) =>
      apiRequest('/users', { body: input, schema: UserAccountSchema }),
    update: (
      id: number,
      input: { full_name?: string; role?: Role; is_active?: boolean; password?: string },
    ) => apiRequest(`/users/${id}`, { method: 'PATCH', body: input, schema: UserAccountSchema }),
    remove: (id: number) => apiRequest<void>(`/users/${id}`, { method: 'DELETE' }),
  },

  data: {
    importFiles: (files: readonly File[], dryRun: boolean) => {
      const form = new FormData();
      files.forEach((file) => form.append('files', file));
      form.append('dry_run', String(dryRun));
      return apiRequest('/data/import', { form, schema: ImportResponseSchema });
    },
    files: () => apiRequest('/data/files', { schema: z.array(SourceFileSchema) }),
    removeFile: (id: number) =>
      apiRequest(`/data/files/${id}`, {
        method: 'DELETE',
        schema: z.object({ removed: z.string(), affected_trials: z.array(z.string()) }),
      }),
    rebuild: () => apiRequest('/data/rebuild', { method: 'POST', schema: RebuildResultSchema }),
    importSample: () => apiRequest('/data/import-sample', { method: 'POST', schema: ImportResponseSchema }),
  },

  sources: {
    get: (filename: string) => apiRequest(`/sources/${segment(filename)}`, { schema: SourceContentSchema }),
  },

  assistant: {
    status: () => apiRequest('/assistant/status', { schema: AssistantStatusSchema }),
    test: (model: string, ollamaBaseUrl: string) =>
      apiRequest('/assistant/test', {
        body: { model: model || null, ollama_base_url: ollamaBaseUrl || null },
        schema: LlmTestResultSchema,
      }),
    graph: () => apiRequest('/assistant/graph', { schema: AgentGraphSchema }),
    streamChat: (
      message: string,
      history: readonly ChatHistoryTurn[],
      onEvent: (event: ChatStreamEvent) => void,
      signal?: AbortSignal,
    ) => streamEvents('/assistant/chat/stream', { message, history }, onEvent, signal),
  },

  audit: (limit = 200) => apiRequest(`/audit?limit=${limit}`, { schema: z.array(AuditEventSchema) }),

  resetDemo: () => apiRequest('/demo/reset', { method: 'POST', schema: z.object({ ok: z.boolean() }) }),
};
