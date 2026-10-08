import type { AppSettings, BadgeColor, CustomFieldDefinition, CustomFieldValue } from '@/types';
import { fmtNum } from '../format';

export const trialTypeColor = (settings: AppSettings, name: string | null): BadgeColor => {
  const key = name?.toLowerCase();
  return (
    settings.reference_data.trial_types.find((entry) => entry.name.toLowerCase() === key)?.color ?? 'stone'
  );
};

export const trialTypeDescription = (settings: AppSettings, name: string | null): string =>
  settings.reference_data.trial_types.find((entry) => entry.name === name)?.description ?? '';

/** Custom field definitions shown in a given place. */
export const customFieldsFor = (
  settings: AppSettings,
  place: 'table' | 'filters' | 'compare' | 'all',
): CustomFieldDefinition[] =>
  settings.custom_fields.fields.filter(
    (field) =>
      place === 'all' ||
      (place === 'table' && field.show_in_table) ||
      (place === 'filters' && field.show_in_filters) ||
      (place === 'compare' && field.show_in_compare),
  );

export const formatCustomValue = (
  definition: CustomFieldDefinition | undefined,
  value: CustomFieldValue | undefined,
  decimals = 2,
): string => {
  if (value === null || value === undefined || value === '') return '–';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number')
    return definition?.unit ? `${fmtNum(value, decimals)} ${definition.unit}` : fmtNum(value, decimals);
  return definition?.unit ? `${value} ${definition.unit}` : value;
};

export const unitNames = (settings: AppSettings): string[] =>
  settings.reference_data.units.map((entry) => entry.unit);

export const vocabularyNames = (
  settings: AppSettings,
  kind: 'crops' | 'products' | 'countries' | 'trial_types',
): string[] => settings.reference_data[kind].map((entry) => entry.name);
