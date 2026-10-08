import { SETTINGS_TABS } from '@/constants';
import type { SettingsTab } from '@/types';

export type AppRoute = { page: 'dashboard' } | { page: 'settings'; tab: SettingsTab };

/** "#/settings/users" -> settings page, users tab; anything unknown -> dashboard. */
export const parseRoute = (hash: string): AppRoute => {
  const [page, tab] = hash.replace(/^#\/?/, '').split('/');
  if (page !== 'settings') return { page: 'dashboard' };
  const known = SETTINGS_TABS.find((config) => config.id === tab);
  return { page: 'settings', tab: known?.id ?? 'account' };
};

export const routeHash = (route: AppRoute): string =>
  route.page === 'settings' ? `#/settings/${route.tab}` : '#/';
