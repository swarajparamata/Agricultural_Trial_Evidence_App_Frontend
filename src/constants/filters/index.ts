import type { FilterField } from '@/types';

/** Built-in filters; custom fields marked "show in filters" are appended after them. */
export const CORE_FILTER_FIELDS: readonly FilterField[] = [
  { key: 'crop', label: 'Crop', allLabel: 'All Crops', kind: 'core' },
  { key: 'product', label: 'Product', allLabel: 'All Products', kind: 'core' },
  { key: 'country', label: 'Country', allLabel: 'All Countries', kind: 'core' },
  { key: 'year', label: 'Year', allLabel: 'All Years', kind: 'core' },
  { key: 'trial_type', label: 'Trial Type', allLabel: 'All Trial Types', kind: 'core' },
  { key: 'status', label: 'Data Status', allLabel: 'All Statuses', kind: 'core' },
];
