import type { AuthClient, AuthUser, UserAccount } from '@/types';
import { api, ApiError, onUnauthorized, tokenStore } from '../api';

type AuthListener = (user: AuthUser | null) => void;

const listeners = new Set<AuthListener>();

/** `undefined` until the stored session has been checked with the backend. */
let currentUser: AuthUser | null | undefined;

let restoring: Promise<void> | null = null;

export const toAuthUser = (account: UserAccount): AuthUser => ({
  uid: String(account.id),
  email: account.email,
  fullName: account.full_name,
  role: account.role,
});

const setCurrentUser = (user: AuthUser | null) => {
  currentUser = user;
  listeners.forEach((listener) => listener(user));
};

const restoreSession = async () => {
  if (!tokenStore.get()) {
    setCurrentUser(null);
    return;
  }
  try {
    setCurrentUser(toAuthUser(await api.auth.me()));
  } catch (error) {
    // An unreachable backend keeps the token so the session resumes once it is back.
    if (error instanceof ApiError && error.status === 401) tokenStore.clear();
    setCurrentUser(null);
  }
};

// An expired or revoked token signs the user out everywhere in the app.
onUnauthorized(() => {
  tokenStore.clear();
  if (currentUser) setCurrentUser(null);
});

/** Re-reads the signed-in user, e.g. after they changed their name. */
export const refreshApiUser = async (): Promise<void> => {
  setCurrentUser(toAuthUser(await api.auth.me()));
};

/** Email/password sign-in against the AgriEvidence API; the session token lives in localStorage. */
export const apiAuthClient: AuthClient = {
  signIn: async (credentials) => {
    const session = await api.auth.login(credentials);
    tokenStore.set(session.access_token);
    setCurrentUser(toAuthUser(session.user));
  },
  signUp: async (credentials) => {
    const session = await api.auth.signup(credentials);
    tokenStore.set(session.access_token);
    setCurrentUser(toAuthUser(session.user));
  },
  signOut: async () => {
    tokenStore.clear();
    setCurrentUser(null);
  },
  onAuthStateChanged: (listener) => {
    listeners.add(listener);
    if (currentUser !== undefined) listener(currentUser);
    else restoring ??= restoreSession();
    return () => {
      listeners.delete(listener);
    };
  },
};
