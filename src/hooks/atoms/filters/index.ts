import { atom } from 'jotai';
import type { TrialFilters } from '@/types';
import { filterTrials, getFilterFields, getFilterOptions } from '@/utils';
import { settingsAtom } from '../settings';
import { trialsAtom } from '../trials';

/** Selected value per filter key; a missing or empty value means "all". */
export const trialFiltersAtom = atom<TrialFilters>({});

/** Core filters plus the custom fields admins marked "show in filters". */
export const filterFieldsAtom = atom((get) => getFilterFields(get(settingsAtom)));

export const setTrialFilterAtom = atom(null, (get, set, key: string, value: string) => {
  set(trialFiltersAtom, { ...get(trialFiltersAtom), [key]: value });
});

export const resetTrialFiltersAtom = atom(null, (_get, set) => {
  set(trialFiltersAtom, {});
});

export const filteredTrialsAtom = atom((get) =>
  filterTrials(get(trialsAtom), get(trialFiltersAtom), get(filterFieldsAtom)),
);

/** Dropdown options are built from every trial, so they stay stable while filters change. */
export const filterOptionsAtom = atom((get) => getFilterOptions(get(trialsAtom), get(filterFieldsAtom)));

export const activeFilterCountAtom = atom(
  (get) => Object.values(get(trialFiltersAtom)).filter(Boolean).length,
);
