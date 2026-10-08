import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '@/utils';

interface ResourceState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Loads data once on mount and again on `reload()`. Earlier data stays visible while reloading.
 * `load` may change identity between renders; the latest one is used.
 */
export const useAsyncResource = <T>(load: () => Promise<T>) => {
  const [state, setState] = useState<ResourceState<T>>({ data: null, error: null, isLoading: true });
  const [version, setVersion] = useState(0);
  const loadRef = useRef(load);

  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    let cancelled = false;
    loadRef.current().then(
      (data) => {
        if (!cancelled) setState({ data, error: null, isLoading: false });
      },
      (error: unknown) => {
        if (!cancelled) setState((current) => ({ ...current, error: errorMessage(error), isLoading: false }));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [version]);

  const reload = useCallback(() => {
    setState((current) => ({ ...current, isLoading: true }));
    setVersion((current) => current + 1);
  }, []);

  return { ...state, reload };
};
