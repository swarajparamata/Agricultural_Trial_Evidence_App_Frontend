import { OFFLINE_DEMO_STORAGE_KEY } from '@/constants';
import { EnvSchema, type AppMode, type Env } from '@/types';

const envResult = EnvSchema.safeParse(import.meta.env);

/** True when every required `VITE_*` variable is set. */
export const isEnvValid = envResult.success;

/** Human-readable configuration problems, e.g. "VITE_API_BASE_URL is required for production builds". */
export const getEnvIssues = (): string[] =>
  envResult.success
    ? []
    : envResult.error.issues.map((issue) => `${issue.path.map(String).join('.')} ${issue.message}`.trim());

export const getEnv = (): Env => {
  if (!envResult.success) {
    throw new Error(`Invalid environment configuration: ${getEnvIssues().join('; ')}`);
  }
  return envResult.data;
};

const offlineDemoChosen = (): boolean => {
  try {
    return sessionStorage.getItem(OFFLINE_DEMO_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

/**
 * The API when `VITE_API_BASE_URL` is set, otherwise the in-browser offline demo (which `EnvSchema` only
 * allows on the dev server). On the dev server the user can also pick the demo when the API is down.
 */
export const getAppMode = (): AppMode => {
  const env = getEnv();
  if (!env.VITE_API_BASE_URL) return 'demo';
  return env.DEV && offlineDemoChosen() ? 'demo' : 'api';
};

/** Whether the "use the offline demo instead" escape hatch may be offered. */
export const canSwitchToOfflineDemo = (): boolean => getEnv().DEV && Boolean(getEnv().VITE_API_BASE_URL);

/** Switches between the API and the offline demo for this browser session, then reloads the app. */
export const setOfflineDemo = (enabled: boolean): void => {
  try {
    if (enabled) sessionStorage.setItem(OFFLINE_DEMO_STORAGE_KEY, '1');
    else sessionStorage.removeItem(OFFLINE_DEMO_STORAGE_KEY);
  } catch {
    // Without storage the mode can't be remembered; the reload falls back to the API.
  }
  window.location.reload();
};

/** Base URL of the backend without a trailing slash, e.g. "http://127.0.0.1:8000". */
export const getApiBaseUrl = (): string => (getEnv().VITE_API_BASE_URL ?? '').replace(/\/+$/, '');
