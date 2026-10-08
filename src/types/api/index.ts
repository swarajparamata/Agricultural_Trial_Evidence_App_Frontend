import { z } from 'zod';
import { RoleSchema } from '../auth';
import { AppSettingsSchema } from '../settings';

export const UserAccountSchema = z.object({
  id: z.number(),
  email: z.string(),
  full_name: z.string(),
  role: RoleSchema,
  is_active: z.boolean(),
  created_at: z.string(),
  last_login_at: z.string().nullable(),
});

export type UserAccount = z.infer<typeof UserAccountSchema>;

export const TokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_at: z.string(),
  user: UserAccountSchema,
});

export const DemoAccountSchema = z.object({
  email: z.string(),
  password: z.string(),
  role: RoleSchema,
  full_name: z.string(),
});

export type DemoAccount = z.infer<typeof DemoAccountSchema>;

/** Public information the login page needs (GET /meta). */
export const AppMetaSchema = z.object({
  app_name: z.string(),
  version: z.string(),
  demo_mode: z.boolean(),
  allow_signup: z.boolean(),
  demo_accounts: z.array(DemoAccountSchema),
});

export type AppMeta = z.infer<typeof AppMetaSchema>;

export const AuditEventSchema = z.object({
  id: z.number(),
  at: z.string(),
  actor: z.string(),
  action: z.string(),
  target: z.string(),
  detail: z.string(),
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;

export const SourceFileSchema = z.object({
  id: z.number(),
  filename: z.string(),
  kind: z.string(),
  parser: z.string(),
  size_bytes: z.number(),
  record_count: z.number(),
  trial_ids: z.array(z.string()),
  warnings: z.array(z.string()),
  uploaded_at: z.string(),
  uploaded_by: z.string(),
});

export type SourceFile = z.infer<typeof SourceFileSchema>;

export const FileImportResultSchema = z.object({
  filename: z.string(),
  kind: z.string().nullable(),
  parser: z.string().nullable(),
  records: z.number(),
  trial_ids: z.array(z.string()),
  created: z.array(z.string()),
  updated: z.array(z.string()),
  conflicts: z.array(z.string()),
  warnings: z.array(z.string()),
  llm_extraction: z.record(z.string(), z.unknown()).nullable(),
  error: z.string().nullable(),
});

export type FileImportResult = z.infer<typeof FileImportResultSchema>;

export const ImportResponseSchema = z.object({
  dry_run: z.boolean(),
  files: z.array(FileImportResultSchema),
  trial_count: z.number(),
});

export type ImportResponse = z.infer<typeof ImportResponseSchema>;

export const RebuildResultSchema = z.object({
  files: z.number(),
  trials: z.number(),
  conflicts: z.number(),
  warnings: z.array(z.string()),
});

export type RebuildResult = z.infer<typeof RebuildResultSchema>;

export const DeletedTrialSchema = z.object({
  id: z.string(),
  deleted_by: z.string(),
  deleted_at: z.string(),
});

export type DeletedTrial = z.infer<typeof DeletedTrialSchema>;

export const SettingsUpdateResponseSchema = z.object({
  settings: AppSettingsSchema,
  rebuild: RebuildResultSchema.nullable(),
});

export type SettingsUpdateResponse = z.infer<typeof SettingsUpdateResponseSchema>;

export const AssistantModeSchema = z.enum(['llm', 'offline', 'unavailable', 'disabled']);

export type AssistantMode = z.infer<typeof AssistantModeSchema>;

export const AssistantStatusSchema = z.object({
  enabled: z.boolean(),
  service_url: z.string(),
  service_reachable: z.boolean(),
  mode: AssistantModeSchema,
  model: z.string().nullable(),
  detail: z.string(),
  ollama: z.record(z.string(), z.unknown()).nullable(),
  service_defaults: z.record(z.string(), z.unknown()).nullable(),
});

export type AssistantStatus = z.infer<typeof AssistantStatusSchema>;

export const LlmTestResultSchema = z.object({
  ok: z.boolean(),
  model: z.string().nullish(),
  base_url: z.string().nullish(),
  latency_ms: z.number().nullish(),
  reply: z.string().nullish(),
  error: z.string().nullish(),
});

export type LlmTestResult = z.infer<typeof LlmTestResultSchema>;

export const AgentGraphSchema = z.object({ agent: z.string(), extraction: z.string() });

export type AgentGraph = z.infer<typeof AgentGraphSchema>;

export const SourceContentSchema = z.object({
  filename: z.string(),
  kind: z.string(),
  parser: z.string(),
  uploaded_at: z.string(),
  uploaded_by: z.string(),
  content: z.string(),
});

export type SourceContent = z.infer<typeof SourceContentSchema>;
