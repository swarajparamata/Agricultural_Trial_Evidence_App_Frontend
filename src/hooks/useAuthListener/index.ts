import { useEffect } from 'react';
import { getAuthClient } from '@/utils';
import { useAuthStore } from '../stores';

/** Keeps the auth store in sync with the auth backend (sign-in, sign-out and session restore on reload). */
export const useAuthListener = () => {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => getAuthClient().onAuthStateChanged(setUser), [setUser]);
};
