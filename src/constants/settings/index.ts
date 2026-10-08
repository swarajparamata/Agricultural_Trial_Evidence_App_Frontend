import {
  Bot,
  Database,
  History,
  Layers,
  SlidersHorizontal,
  Tags,
  UserRound,
  Users,
  Workflow,
} from 'lucide-react';
import type {
  BadgeColor,
  CompareFieldKey,
  ConflictStrategy,
  CustomFieldDefinition,
  CustomFieldType,
  ImportField,
  SettingsTabConfig,
} from '@/types';

/** Settings pages in menu order; viewers only see the ones not marked `adminOnly`. */
export const SETTINGS_TABS: readonly SettingsTabConfig[] = [
  { id: 'account', label: 'My account', icon: UserRound, adminOnly: false },
  { id: 'users', label: 'Users & access', icon: Users, adminOnly: true },
  { id: 'data', label: 'Trials & data', icon: Database, adminOnly: true },
  { id: 'fields', label: 'Custom fields', icon: Layers, adminOnly: true },
  { id: 'reference', label: 'Reference data', icon: Tags, adminOnly: true },
  { id: 'display', label: 'Display & compare', icon: SlidersHorizontal, adminOnly: true },
  { id: 'import-rules', label: 'Import rules', icon: Workflow, adminOnly: true },
  { id: 'assistant', label: 'AI assistant', icon: Bot, adminOnly: true },
  { id: 'activity', label: 'Activity', icon: History, adminOnly: true },
];

/** Badge styles per trial-type colour (pill in tables, tag on cards). */
export const BADGE_COLOR_CLASSES: Record<BadgeColor, { pill: string; tag: string; swatch: string }> = {
  blue: {
    pill: 'border-blue-200 bg-blue-50 text-blue-700',
    tag: 'bg-blue-100 text-blue-700',
    swatch: 'bg-blue-500',
  },
  amber: {
    pill: 'border-amber-200 bg-amber-50 text-amber-800',
    tag: 'bg-amber-100 text-amber-800',
    swatch: 'bg-amber-500',
  },
  orange: {
    pill: 'border-orange-200 bg-orange-50 text-orange-700',
    tag: 'bg-orange-100 text-orange-700',
    swatch: 'bg-orange-500',
  },
  violet: {
    pill: 'border-violet-200 bg-violet-50 text-violet-700',
    tag: 'bg-violet-100 text-violet-700',
    swatch: 'bg-violet-500',
  },
  teal: {
    pill: 'border-teal-200 bg-teal-50 text-teal-700',
    tag: 'bg-teal-100 text-teal-700',
    swatch: 'bg-teal-500',
  },
  rose: {
    pill: 'border-rose-200 bg-rose-50 text-rose-700',
    tag: 'bg-rose-100 text-rose-700',
    swatch: 'bg-rose-500',
  },
  stone: {
    pill: 'border-stone-200 bg-stone-50 text-stone-700',
    tag: 'bg-stone-100 text-stone-700',
    swatch: 'bg-stone-400',
  },
};

export const BADGE_COLORS = Object.keys(BADGE_COLOR_CLASSES) as BadgeColor[];

export const CUSTOM_FIELD_TYPE_LABELS: Record<CustomFieldType, string> = {
  text: 'Short text',
  textarea: 'Long text',
  number: 'Number',
  select: 'Choice list',
  boolean: 'Yes / no',
  date: 'Date',
};

export const CONFLICT_STRATEGY_LABELS: Record<ConflictStrategy, { label: string; description: string }> = {
  source_priority: {
    label: 'Use the highest-priority source',
    description:
      'Show the value from the first source type in the priority list; the conflict stays flagged.',
  },
  mean: {
    label: 'Use the mean of the values',
    description:
      'Average conflicting numbers (other fields fall back to priority); the conflict stays flagged.',
  },
  manual: {
    label: 'Leave it empty until an admin decides',
    description: 'Conflicting values are not shown until an admin resolves them.',
  },
};

export const SOURCE_KIND_LABELS = {
  manual: 'Manual entries',
  csv: 'Spreadsheets (CSV)',
  report: 'Text reports',
} as const;

export const IMPORT_FIELD_LABELS: Record<ImportField, string> = {
  trial_id: 'Trial ID',
  crop: 'Crop',
  product: 'Product',
  country: 'Country',
  year: 'Year',
  trial_type: 'Trial type',
  treatment_yield: 'Treated yield',
  control_yield: 'Control yield',
  yield_unit: 'Yield unit',
  notes: 'Notes',
};

export const COMPARE_FIELD_LABELS: Record<CompareFieldKey, string> = {
  crop: 'Crop',
  product: 'Product',
  country: 'Country',
  year: 'Year',
  trial_type: 'Trial type',
  treatment_yield: 'Treated yield',
  control_yield: 'Control yield',
  yield_difference: 'Difference',
  uplift_pct: 'Uplift',
  status: 'Data status',
  caveats: 'Caveats',
  sources: 'Sources',
};

/** Starting point of the "Add field" editor. */
export const EMPTY_CUSTOM_FIELD: CustomFieldDefinition = {
  key: '',
  label: '',
  type: 'text',
  options: [],
  unit: null,
  required: false,
  description: '',
  show_in_table: false,
  show_in_filters: false,
  show_in_compare: true,
  chartable: false,
  source_aliases: [],
};
