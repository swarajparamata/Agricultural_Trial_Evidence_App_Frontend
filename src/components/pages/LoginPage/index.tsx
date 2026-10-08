import { ApiUnavailableNotice, DemoAuthNotice, LoginForm } from '@/components/auth';
import { BrandLogo, Spinner } from '@/components/ui';
import { useAppMeta } from '@/hooks';
import { getAppMode } from '@/utils';

export const LoginPage = () => {
  const isApi = getAppMode() === 'api';
  const { meta, error, isLoading, retry } = useAppMeta();

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-xl">
        <BrandLogo className="mb-6" name={meta?.app_name} />
        {!isApi && <DemoAuthNotice />}
        {isApi && isLoading && !meta && (
          <div className="mb-4 flex justify-center">
            <Spinner label="Connecting to the API…" />
          </div>
        )}
        {isApi && error && <ApiUnavailableNotice message={error} onRetry={retry} isRetrying={isLoading} />}
        <LoginForm
          demoAccounts={meta?.demo_accounts ?? []}
          allowSignUp={!isApi || Boolean(meta?.allow_signup)}
        />
      </div>
    </div>
  );
};
