import { useCallback, useEffect, useState } from 'react';
import type { AppMeta } from '@/types';
import { api, errorMessage, getAppMode } from '@/utils';

interface MetaState {
  meta: AppMeta | null;
  error: string | null;
  isLoading: boolean;
}

/** Public app info for the login page: demo accounts and whether sign-up is open. */
export const useAppMeta = () => {
  const isApi = getAppMode() === 'api';
  const [state, setState] = useState<MetaState>({ meta: null, error: null, isLoading: isApi });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isApi) return;
    let cancelled = false;
    api.meta().then(
      (meta) => {
        if (!cancelled) setState({ meta, error: null, isLoading: false });
      },
      (error: unknown) => {
        if (!cancelled) setState({ meta: null, error: errorMessage(error), isLoading: false });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [isApi, attempt]);

  const retry = useCallback(() => {
    setState((current) => ({ ...current, isLoading: true }));
    setAttempt((current) => current + 1);
  }, []);

  return { ...state, retry };
};
