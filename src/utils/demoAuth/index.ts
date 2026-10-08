import { DEMO_ADMIN_EMAIL_PREFIX, DEMO_SESSION_STORAGE_KEY } from '@/constants';
import type { AuthClient, AuthCredentials, AuthUser } from '@/types';

type AuthListener = (user: AuthUser | null) => void;

const listeners = new Set<AuthListener>();

/** Emails starting with "admin" get the admin role, so the offline demo can show both roles. */
const toDemoUser = (email: string): AuthUser => ({
  uid: `demo:${email.toLowerCase()}`,
  email,
  fullName: email.split('@')[0] ?? email,
  role: email.trim().toLowerCase().startsWith(DEMO_ADMIN_EMAIL_PREFIX) ? 'admin' : 'viewer',
});

// Storage can be blocked (e.g. some private windows); the session then lasts until the page is closed.
const readStoredUser = (): AuthUser | null => {
  try {
    const email = localStorage.getItem(DEMO_SESSION_STORAGE_KEY);
    return email ? toDemoUser(email) : null;
  } catch {
    return null;
  }
};

const storeUser = (user: AuthUser | null) => {
  try {
    if (user?.email) localStorage.setItem(DEMO_SESSION_STORAGE_KEY, user.email);
    else localStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
  } catch {
    // Keep the session in memory only.
  }
};

/** `undefined` until the stored session has been read. */
let currentUser: AuthUser | null | undefined;

const setCurrentUser = (user: AuthUser | null) => {
  currentUser = user;
  storeUser(user);
  listeners.forEach((listener) => listener(user));
};

const startSession = async ({ email }: AuthCredentials) => setCurrentUser(toDemoUser(email.trim()));

/**
 * Offline demo login, used when the app runs without the backend (dev server only).
 * Any valid email and password signs in; nothing leaves the browser and no password is kept.
 */
export const demoAuthClient: AuthClient = {
  signIn: startSession,
  signUp: startSession,
  signOut: async () => setCurrentUser(null),
  onAuthStateChanged: (listener) => {
    if (currentUser === undefined) currentUser = readStoredUser();
    listeners.add(listener);
    listener(currentUser);
    return () => {
      listeners.delete(listener);
    };
  },
};
