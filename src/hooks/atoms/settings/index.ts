import { atom } from 'jotai';
import { DEMO_SETTINGS } from '@/constants';
import type { AppSettings } from '@/types';
import { api, errorMessage, getAppMode } from '@/utils';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

/** The admin settings; the defaults stand in until the backend's copy has loaded. */
export const settingsAtom = atom<AppSettings>(DEMO_SETTINGS);

export const settingsStatusAtom = atom<{ status: LoadStatus; error: string | null }>({
  status: 'idle',
  error: null,
});

export const applySettingsAtom = atom(null, (_get, set, settings: AppSettings) => {
  set(settingsAtom, settings);
  set(settingsStatusAtom, { status: 'ready', error: null });
});

export const loadSettingsAtom = atom(null, async (get, set) => {
  if (getAppMode() !== 'api') {
    set(settingsStatusAtom, { status: 'ready', error: null });
    return;
  }
  // A refetch keeps the pages rendered (and their state, such as a success message) until new data arrives.
  if (get(settingsStatusAtom).status !== 'ready') set(settingsStatusAtom, { status: 'loading', error: null });
  try {
    set(applySettingsAtom, await api.settings.get());
  } catch (error) {
    set(settingsStatusAtom, { status: 'error', error: errorMessage(error) });
  }
});
