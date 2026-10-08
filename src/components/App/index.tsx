import { Provider as JotaiProvider } from 'jotai';
import { AuthGate } from '@/components/auth';
import { AppShell } from '@/components/layout';
import { ConfigErrorPage, LoadingPage, LoginPage } from '@/components/pages';
import { useAuthStore } from '@/hooks';
import { getEnvIssues, isEnvValid } from '@/utils';

/** A fresh Jotai store per user, so one user's trials, filters and drafts never leak into the next session. */
const SignedInApp = () => {
  const uid = useAuthStore((state) => state.user?.uid);
  return (
    <JotaiProvider key={uid}>
      <AppShell />
    </JotaiProvider>
  );
};

export const App = () =>
  isEnvValid ? (
    <AuthGate loadingFallback={<LoadingPage />} signedOutFallback={<LoginPage />}>
      <SignedInApp />
    </AuthGate>
  ) : (
    <ConfigErrorPage issues={getEnvIssues()} />
  );
