import { CORE_FILTER_FIELDS, TRIAL_STATUS_META } from '@/constants';
import type {
  AppSettings,
  FilterField,
  FilterOptions,
  Trial,
  TrialConflict,
  TrialFilters,
  TrialStatus,
} from '@/types';
import { naturalCompare } from '../format';
import { customFieldsFor } from '../settings';

export const CUSTOM_PREFIX = 'custom:';

/** Core filters plus every custom field marked "show in filters". */
export const getFilterFields = (settings: AppSettings): FilterField[] => [
  ...CORE_FILTER_FIELDS,
  ...customFieldsFor(settings, 'filters').map((field) => ({
    key: `${CUSTOM_PREFIX}${field.key}`,
    label: field.label,
    allLabel: `Any ${field.label.toLowerCase()}`,
    kind: 'custom' as const,
  })),
];

/** The value a filter compares against, as text ("" when the trial has none). */
export const filterValue = (trial: Trial, key: string): string => {
  if (key.startsWith(CUSTOM_PREFIX)) {
    const value = trial.custom_fields[key.slice(CUSTOM_PREFIX.length)];
    if (value === null || value === undefined) return '';
    return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
  }
  const value = trial[key as keyof Trial];
  return value === null || value === undefined ? '' : String(value);
};

/** Distinct values per filter, sorted naturally (so years sort numerically). */
export const getFilterOptions = (trials: readonly Trial[], fields: readonly FilterField[]): FilterOptions =>
  Object.fromEntries(
    fields.map(({ key }) => [
      key,
      Array.from(new Set(trials.map((trial) => filterValue(trial, key)).filter(Boolean))).sort(
        naturalCompare,
      ),
    ]),
  );

export const filterTrials = (
  trials: readonly Trial[],
  filters: TrialFilters,
  fields: readonly FilterField[],
): Trial[] =>
  trials.filter((trial) =>
    fields.every(({ key }) => !filters[key] || filterValue(trial, key) === filters[key]),
  );

/** Display text of a filter option: status keys become their labels. */
export const filterOptionLabel = (key: string, value: string): string =>
  key === 'status' ? (TRIAL_STATUS_META[value as TrialStatus]?.label ?? value) : value;

export const sourceFiles = (trial: Trial): string[] => [
  ...new Set(trial.sources.map((source) => source.file)),
];

export const openConflicts = (trial: Trial): TrialConflict[] =>
  trial.conflicts.filter((conflict) => conflict.status === 'open');

/** "Harvest Plus on Wheat", or whichever part is known. */
export const describeTrial = (trial: Pick<Trial, 'product' | 'crop'>): string =>
  trial.product && trial.crop
    ? `${trial.product} on ${trial.crop}`
    : (trial.product ?? trial.crop ?? 'Trial');

/** Why a trial has no uplift, for labels in tables and charts. */
export const missingUpliftReason = (trial: Trial): string => {
  if (trial.treatment_yield === null) return 'no treated yield';
  if (trial.control_yield === null) return 'no control yield';
  return 'not available';
};
