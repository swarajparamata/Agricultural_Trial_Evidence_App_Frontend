import { CircleAlert, CircleCheck, CircleDashed, FileUp, FileWarning, PenLine } from 'lucide-react';
import type { AddTrialMethodConfig, CoreTrialField, StatusMeta, TableColumnKey, TrialStatus } from '@/types';

export const TRIAL_YEAR_RANGE = { min: 1900, max: 2100 } as const;

export const ADD_TRIAL_METHODS: readonly AddTrialMethodConfig[] = [
  { id: 'manual', label: 'Enter manually', icon: PenLine },
  { id: 'files', label: 'Upload files', icon: FileUp },
];

export const TRIAL_STATUSES = ['consistent', 'single_source', 'incomplete', 'conflict', 'manual'] as const;

/** Data-quality status of a reconciled trial; always shown with its icon and label, never colour alone. */
export const TRIAL_STATUS_META: Record<TrialStatus, StatusMeta> = {
  consistent: {
    label: 'Consistent',
    description: 'Every source agrees on every value.',
    tone: 'good',
    icon: CircleCheck,
  },
  single_source: {
    label: 'Single source',
    description: 'Only one source document reports this trial.',
    tone: 'warning',
    icon: FileWarning,
  },
  incomplete: {
    label: 'Incomplete',
    description: 'A yield or another core value is missing.',
    tone: 'serious',
    icon: CircleDashed,
  },
  conflict: {
    label: 'Conflict',
    description: 'Sources disagree on at least one value.',
    tone: 'critical',
    icon: CircleAlert,
  },
  manual: {
    label: 'Manual entry',
    description: 'Entered by an admin without a source document.',
    tone: 'neutral',
    icon: PenLine,
  },
};

export const TABLE_COLUMN_LABELS: Record<TableColumnKey, string> = {
  id: 'ID',
  crop: 'Crop',
  product: 'Product',
  country: 'Country',
  year: 'Year',
  trial_type: 'Type',
  treatment_yield: 'Treated',
  control_yield: 'Control',
  yield_difference: 'Difference',
  uplift_pct: 'Uplift',
  status: 'Status',
  sources: 'Sources',
};

export const CORE_FIELD_LABELS: Record<CoreTrialField, string> = {
  crop: 'Crop',
  product: 'Product',
  country: 'Country',
  year: 'Year',
  trial_type: 'Trial type',
  treatment_yield: 'Treated yield',
  control_yield: 'Control yield',
};

/** Fields an admin can edit on a trial, besides custom fields and notes. */
export const EDITABLE_CORE_FIELDS: readonly CoreTrialField[] = [
  'crop',
  'product',
  'country',
  'year',
  'trial_type',
  'treatment_yield',
  'control_yield',
];

export const YIELD_FIELDS = ['treatment_yield', 'control_yield'] as const;
