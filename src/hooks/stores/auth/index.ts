import { create } from 'zustand';
import type { AuthCredentials, AuthMode, AuthStatus, AuthUser } from '@/types';
import { getAuthClient, getAuthErrorMessage } from '@/utils';
import { useChatStore } from '../chat';

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
  isSubmitting: boolean;
  setUser: (user: AuthUser | null) => void;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signUp: (credentials: AuthCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()((set) => {
  // The new user arrives through the auth state listener (see useAuthListener), not from the action's result.
  const submitCredentials = async (mode: AuthMode, credentials: AuthCredentials) => {
    set({ isSubmitting: true, error: null });
    try {
      await getAuthClient()[mode](credentials);
    } catch (error) {
      set({ error: getAuthErrorMessage(error) });
    } finally {
      set({ isSubmitting: false });
    }
  };

  return {
    user: null,
    status: 'loading',
    error: null,
    isSubmitting: false,

    setUser: (user) => set({ user, status: user ? 'authenticated' : 'unauthenticated' }),

    signIn: (credentials) => submitCredentials('signIn', credentials),

    signUp: (credentials) => submitCredentials('signUp', credentials),

    signOut: async () => {
      try {
        await getAuthClient().signOut();
        // Don't carry one user's conversation over to the next session.
        useChatStore.getState().reset();
      } catch (error) {
        console.error('Sign-out failed:', error);
      }
    },

    clearError: () => set({ error: null }),
  };
});
