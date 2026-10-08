export interface FilterField {
  /** A trial property (`crop`, `status`, …) or a custom field key. */
  key: string;
  label: string;
  allLabel: string;
  kind: 'core' | 'custom';
}

/** Selected value per filter key; an empty string means "all". */
export type TrialFilters = Record<string, string>;

export type FilterOptions = Record<string, string[]>;
