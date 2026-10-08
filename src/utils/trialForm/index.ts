import { z } from 'zod';
import { TRIAL_YEAR_RANGE } from '@/constants';
import type {
  AppSettings,
  CustomFieldDefinition,
  CustomFieldValue,
  Trial,
  TrialFormField,
  TrialFormValues,
  TrialInput,
  TrialUpdateInput,
} from '@/types';
import { unitNames, vocabularyNames } from '../settings';
import { CUSTOM_PREFIX } from '../trials';

export type TrialFormMode = 'create' | 'edit';

const CURRENT_YEAR = new Date().getFullYear();

const customName = (definition: CustomFieldDefinition) => `${CUSTOM_PREFIX}${definition.key}`;

const customFormField = (definition: CustomFieldDefinition): TrialFormField => {
  const base = {
    name: customName(definition),
    label: definition.unit ? `${definition.label} (${definition.unit})` : definition.label,
    hint: definition.description || undefined,
    required: definition.required,
  };
  switch (definition.type) {
    case 'number':
      return { ...base, control: 'number', step: 'any' };
    case 'select':
      return {
        ...base,
        control: 'select',
        options: definition.options,
        emptyLabel: definition.required ? undefined : '—',
      };
    case 'boolean':
      return { ...base, control: 'boolean' };
    case 'date':
      return { ...base, control: 'date' };
    case 'textarea':
      return { ...base, control: 'textarea', fullWidth: true };
    case 'text':
      return { ...base, control: 'text' };
  }
};

/** Layout of the add/edit trial form: core fields, then the admin-defined custom fields. */
export const buildTrialFormFields = (settings: AppSettings, mode: TrialFormMode): TrialFormField[] => [
  ...(mode === 'create'
    ? [{ name: 'id', label: 'Trial ID', control: 'text', placeholder: 'e.g. T10', required: true } as const]
    : []),
  {
    name: 'crop',
    label: 'Crop',
    control: 'combo',
    options: vocabularyNames(settings, 'crops'),
    placeholder: 'e.g. Wheat',
    required: true,
  },
  {
    name: 'product',
    label: 'Product',
    control: 'combo',
    options: vocabularyNames(settings, 'products'),
    placeholder: 'e.g. Harvest Plus',
    required: true,
  },
  {
    name: 'country',
    label: 'Country',
    control: 'combo',
    options: vocabularyNames(settings, 'countries'),
    placeholder: 'e.g. France',
    required: true,
  },
  { name: 'year', label: 'Year', control: 'number', placeholder: String(CURRENT_YEAR), required: true },
  {
    name: 'trial_type',
    label: 'Trial type',
    control: 'select',
    options: vocabularyNames(settings, 'trial_types'),
    required: true,
  },
  {
    name: 'yield_unit',
    label: 'Yield unit',
    control: 'select',
    options: unitNames(settings),
    required: true,
  },
  {
    name: 'treatment_yield',
    label: 'Treated yield',
    control: 'number',
    step: 'any',
    placeholder: 'e.g. 8.4',
    required: true,
  },
  {
    name: 'control_yield',
    label: 'Control yield',
    control: 'number',
    step: 'any',
    placeholder: 'e.g. 8.0',
    hint: 'Leave empty if the trial had no untreated control.',
  },
  ...settings.custom_fields.fields.map(customFormField),
  mode === 'create'
    ? {
        name: 'notes',
        label: 'Notes',
        control: 'textarea',
        placeholder: 'Sites, replication, statistics…',
        fullWidth: true,
      }
    : {
        name: 'reason',
        label: 'Reason for the change',
        control: 'text',
        placeholder: 'e.g. corrected from the lab sheet',
        fullWidth: true,
      },
];

const customText = (value: CustomFieldValue | undefined): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};

/** Blank form; year, trial type and unit start with sensible defaults. */
export const emptyTrialForm = (settings: AppSettings): TrialFormValues => ({
  id: '',
  crop: '',
  product: '',
  country: '',
  year: String(CURRENT_YEAR),
  trial_type: settings.reference_data.trial_types[0]?.name ?? '',
  yield_unit: settings.display.yield_unit,
  treatment_yield: '',
  control_yield: '',
  notes: '',
  ...Object.fromEntries(settings.custom_fields.fields.map((definition) => [customName(definition), ''])),
});

/** Current values of a trial as form text (yields in the display unit). */
export const trialToFormValues = (trial: Trial, settings: AppSettings): TrialFormValues => ({
  crop: trial.crop ?? '',
  product: trial.product ?? '',
  country: trial.country ?? '',
  year: trial.year === null ? '' : String(trial.year),
  trial_type: trial.trial_type ?? '',
  yield_unit: trial.yield_unit,
  treatment_yield: trial.treatment_yield === null ? '' : String(trial.treatment_yield),
  control_yield: trial.control_yield === null ? '' : String(trial.control_yield),
  reason: '',
  ...Object.fromEntries(
    settings.custom_fields.fields.map((definition) => [
      customName(definition),
      customText(trial.custom_fields[definition.key]),
    ]),
  ),
});

const requiredText = (label: string) => z.string().trim().min(1, `${label} is required`);

const numberText = (label: string, schema: z.ZodNumber) =>
  requiredText(label)
    .transform(Number)
    .pipe(schema.refine((value) => Number.isFinite(value), `${label} must be a number`));

const optionalNumberText = (label: string) =>
  z
    .string()
    .trim()
    .transform((value) => (value === '' ? null : Number(value)))
    .pipe(
      z
        .number({ error: `${label} must be a number` })
        .nonnegative(`${label} cannot be negative`)
        .refine((value) => Number.isFinite(value), `${label} must be a number`)
        .nullable(),
    );

const customFieldSchema = (definition: CustomFieldDefinition): z.ZodType<CustomFieldValue> => {
  const label = definition.label;
  const missing = (value: string) => definition.required && value.trim() === '';
  const text = z.string().refine((value) => !missing(value), `${label} is required`);
  switch (definition.type) {
    case 'number':
      return text
        .transform((value) => (value.trim() === '' ? null : Number(value)))
        .pipe(z.number({ error: `${label} must be a number` }).nullable());
    case 'boolean':
      return text.transform((value) => (value === 'Yes' ? true : value === 'No' ? false : null));
    case 'select':
      return text
        .refine(
          (value) => value === '' || definition.options.includes(value),
          `Choose one of: ${definition.options.join(', ')}`,
        )
        .transform((value) => value || null);
    case 'date':
      return text
        .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), `${label} must be a date`)
        .transform((value) => value || null);
    default:
      return text.transform((value) => value.trim() || null);
  }
};

/**
 * Validates the raw form text and converts it into a trial payload.
 * Built per submit because trial IDs must be unique and custom fields come from the settings.
 */
export const createTrialFormSchema = (
  settings: AppSettings,
  existingIds: readonly string[],
  mode: TrialFormMode,
) => {
  const taken = new Set(existingIds.map((id) => id.toLowerCase()));
  const custom = z.object(
    Object.fromEntries(
      settings.custom_fields.fields.map((definition) => [
        customName(definition),
        customFieldSchema(definition),
      ]),
    ) as Record<string, z.ZodType<CustomFieldValue>>,
  );
  const core = z.object({
    id:
      mode === 'create'
        ? requiredText('Trial ID')
            .regex(/^[A-Za-z0-9][A-Za-z0-9_.-]*$/, 'Use letters, digits, dots, dashes or underscores')
            .refine((id) => !taken.has(id.toLowerCase()), 'A trial with this ID already exists')
        : z.string().optional(),
    crop: requiredText('Crop'),
    product: requiredText('Product'),
    country: requiredText('Country'),
    year: numberText(
      'Year',
      z
        .number({ error: 'Year must be a number' })
        .int('Year must be a whole number')
        .min(TRIAL_YEAR_RANGE.min, `Year must be ${TRIAL_YEAR_RANGE.min} or later`)
        .max(TRIAL_YEAR_RANGE.max, `Year must be ${TRIAL_YEAR_RANGE.max} or earlier`),
    ),
    trial_type: requiredText('Trial type'),
    yield_unit: requiredText('Yield unit'),
    treatment_yield: numberText(
      'Treated yield',
      z.number({ error: 'Treated yield must be a number' }).nonnegative('Treated yield cannot be negative'),
    ),
    control_yield: optionalNumberText('Control yield'),
    notes: z.string().trim().max(4000).optional(),
    reason: z.string().trim().max(500).optional(),
  });
  return z.intersection(core, custom).transform((values): { input: TrialInput; reason: string } => ({
    reason: values.reason ?? '',
    input: {
      id: values.id?.trim() ?? '',
      crop: values.crop,
      product: values.product,
      country: values.country,
      year: values.year,
      trial_type: values.trial_type,
      treatment_yield: values.treatment_yield,
      control_yield: values.control_yield,
      yield_unit: values.yield_unit,
      notes: values.notes ?? '',
      custom_fields: Object.fromEntries(
        settings.custom_fields.fields.map((definition) => [
          definition.key,
          (values as Record<string, unknown>)[customName(definition)] as CustomFieldValue,
        ]),
      ),
    },
  }));
};

/** Only the fields the admin changed, so imported values that weren't touched stay with their sources. */
export const toTrialUpdate = (
  initial: TrialFormValues,
  current: TrialFormValues,
  input: TrialInput,
  reason: string,
): TrialUpdateInput => {
  const changed = (name: string) => (initial[name] ?? '').trim() !== (current[name] ?? '').trim();
  const update: TrialUpdateInput = {};
  if (changed('crop')) update.crop = input.crop;
  if (changed('product')) update.product = input.product;
  if (changed('country')) update.country = input.country;
  if (changed('year')) update.year = input.year;
  if (changed('trial_type')) update.trial_type = input.trial_type;
  const unitChanged = changed('yield_unit');
  if (unitChanged || changed('treatment_yield')) update.treatment_yield = input.treatment_yield;
  if (unitChanged || changed('control_yield')) update.control_yield = input.control_yield;
  if (update.treatment_yield !== undefined || update.control_yield !== undefined)
    update.yield_unit = input.yield_unit;
  const customChanges = Object.fromEntries(
    Object.entries(input.custom_fields).filter(([key]) => changed(`${CUSTOM_PREFIX}${key}`)),
  );
  if (Object.keys(customChanges).length > 0) update.custom_fields = customChanges;
  if (reason) update.reason = reason;
  return update;
};
