import type { ReactNode } from 'react';
import { useAuthListener, useAuthStore } from '@/hooks';

interface AuthGateProps {
  /** Shown until the auth backend reports the initial session. */
  loadingFallback: ReactNode;
  signedOutFallback: ReactNode;
  children: ReactNode;
}

/** Renders `children` only for a signed-in user. */
export const AuthGate = ({ loadingFallback, signedOutFallback, children }: AuthGateProps) => {
  useAuthListener();
  const status = useAuthStore((state) => state.status);

  if (status === 'loading') return loadingFallback;
  if (status === 'unauthenticated') return signedOutFallback;
  return children;
};
