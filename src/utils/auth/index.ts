import { GENERIC_AUTH_ERROR } from '@/constants';
import type { AuthClient } from '@/types';
import { apiAuthClient } from '../apiAuth';
import { demoAuthClient } from '../demoAuth';
import { getAppMode } from '../env';

/** The backend login, or the offline demo login when the app runs without the API. */
export const getAuthClient = (): AuthClient => (getAppMode() === 'api' ? apiAuthClient : demoAuthClient);

/** Turns a failed sign-in, sign-up or sign-out into a message that can be shown to the user. */
export const getAuthErrorMessage = (error: unknown): string =>
  error instanceof Error && error.message ? error.message : GENERIC_AUTH_ERROR;
