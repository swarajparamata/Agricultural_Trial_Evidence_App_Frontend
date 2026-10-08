import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { parseRoute, routeHash, type AppRoute } from '@/utils';

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
};

const readHash = () => window.location.hash;

/** The current page from the URL hash ("#/settings/users"), so reloads and the back button keep the page. */
export const useRoute = () => {
  const hash = useSyncExternalStore(subscribe, readHash, () => '');
  const route = useMemo(() => parseRoute(hash), [hash]);
  const navigate = useCallback((next: AppRoute) => {
    window.location.hash = routeHash(next);
  }, []);
  return { route, navigate };
};
