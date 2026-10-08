import { APP_NAME } from '@/constants';

export const LoadingPage = () => (
  <div role="status" className="flex min-h-screen items-center justify-center bg-stone-50 font-medium text-emerald-900">
    Loading {APP_NAME}...
  </div>
);
