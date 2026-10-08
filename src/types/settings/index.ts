import type { LucideIcon } from 'lucide-react';
import { z } from 'zod';

export const TABLE_COLUMN_KEYS = [
  'id',
  'crop',
  'product',
  'country',
  'year',
  'trial_type',
  'treatment_yield',
  'control_yield',
  'yield_difference',
  'uplift_pct',
  'status',
  'sources',
] as const;

export const COMPARE_FIELD_KEYS = [
  'crop',
  'product',
  'country',
  'year',
  'trial_type',
  'treatment_yield',
  'control_yield',
  'yield_difference',
  'uplift_pct',
  'status',
  'caveats',
  'sources',
] as const;

export const IMPORT_FIELDS = [
  'trial_id',
  'crop',
  'product',
  'country',
  'year',
  'trial_type',
  'treatment_yield',
  'control_yield',
  'yield_unit',
  'notes',
] as const;

export const SOURCE_KINDS = ['manual', 'csv', 'report'] as const;

export const BadgeColorSchema = z.enum(['blue', 'amber', 'orange', 'violet', 'teal', 'rose', 'stone']);

export const VocabularyEntrySchema = z.object({ name: z.string(), aliases: z.array(z.string()) });

export const CountryEntrySchema = VocabularyEntrySchema.extend({ code: z.string().nullable() });

export const TrialTypeEntrySchema = VocabularyEntrySchema.extend({
  color: BadgeColorSchema,
  description: z.string(),
});

export const UnitEntrySchema = z.object({
  unit: z.string(),
  to_kg_per_ha: z.number(),
  aliases: z.array(z.string()),
});

export const ReferenceDataSchema = z.object({
  crops: z.array(VocabularyEntrySchema),
  products: z.array(VocabularyEntrySchema),
  countries: z.array(CountryEntrySchema),
  trial_types: z.array(TrialTypeEntrySchema),
  units: z.array(UnitEntrySchema),
  strict_vocabulary: z.boolean(),
});

export const CustomFieldTypeSchema = z.enum(['text', 'textarea', 'number', 'select', 'boolean', 'date']);

export const CustomFieldDefinitionSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: CustomFieldTypeSchema,
  options: z.array(z.string()),
  unit: z.string().nullable(),
  required: z.boolean(),
  description: z.string(),
  show_in_table: z.boolean(),
  show_in_filters: z.boolean(),
  show_in_compare: z.boolean(),
  chartable: z.boolean(),
  source_aliases: z.array(z.string()),
});

export const DisplaySettingsSchema = z.object({
  app_name: z.string(),
  organization: z.string(),
  yield_unit: z.string(),
  decimals: z.number().int(),
  table_columns: z.array(z.enum(TABLE_COLUMN_KEYS)),
});

export const ComparisonSettingsSchema = z.object({
  max_trials: z.number().int(),
  show_yield_chart: z.boolean(),
  show_uplift_chart: z.boolean(),
  show_difference_chart: z.boolean(),
  show_custom_charts: z.boolean(),
  highlight_differences: z.boolean(),
  fields: z.array(z.enum(COMPARE_FIELD_KEYS)),
});

export const IngestionSettingsSchema = z.object({
  field_aliases: z.record(z.enum(IMPORT_FIELDS), z.array(z.string())),
  default_yield_unit: z.string(),
  use_llm_extraction: z.boolean(),
});

export const CaveatRuleSchema = z.object({
  label: z.string(),
  match_all: z.array(z.string()),
  match_any: z.array(z.string()),
});

export const ConflictStrategySchema = z.enum(['source_priority', 'mean', 'manual']);

export const ReconciliationSettingsSchema = z.object({
  numeric_tolerance_pct: z.number(),
  conflict_strategy: ConflictStrategySchema,
  source_priority: z.array(z.enum(SOURCE_KINDS)),
  caveat_rules: z.array(CaveatRuleSchema),
});

export const AssistantSettingsSchema = z.object({
  enabled: z.boolean(),
  model: z.string(),
  ollama_base_url: z.string(),
  temperature: z.number(),
  num_ctx: z.number().int(),
  think: z.boolean(),
  max_tool_iterations: z.number().int(),
  max_revisions: z.number().int(),
  enable_reflection: z.boolean(),
  offline_fallback: z.boolean(),
  force_offline: z.boolean(),
  history_turns: z.number().int(),
  extra_instructions: z.string(),
  suggested_questions: z.array(z.string()),
});

export const AccessSettingsSchema = z.object({ allow_self_signup: z.boolean() });

/** Everything an admin can configure; every signed-in user can read it. */
export const AppSettingsSchema = z.object({
  display: DisplaySettingsSchema,
  reference_data: ReferenceDataSchema,
  custom_fields: z.object({ fields: z.array(CustomFieldDefinitionSchema) }),
  comparison: ComparisonSettingsSchema,
  ingestion: IngestionSettingsSchema,
  reconciliation: ReconciliationSettingsSchema,
  assistant: AssistantSettingsSchema,
  access: AccessSettingsSchema,
});

export type AppSettings = z.infer<typeof AppSettingsSchema>;

export type SettingsSectionName = keyof AppSettings;

export type BadgeColor = z.infer<typeof BadgeColorSchema>;

export type VocabularyEntry = z.infer<typeof VocabularyEntrySchema>;

export type CountryEntry = z.infer<typeof CountryEntrySchema>;

export type TrialTypeEntry = z.infer<typeof TrialTypeEntrySchema>;

export type UnitEntry = z.infer<typeof UnitEntrySchema>;

export type ReferenceData = z.infer<typeof ReferenceDataSchema>;

export type CustomFieldType = z.infer<typeof CustomFieldTypeSchema>;

export type CustomFieldDefinition = z.infer<typeof CustomFieldDefinitionSchema>;

export type CaveatRule = z.infer<typeof CaveatRuleSchema>;

export type ConflictStrategy = z.infer<typeof ConflictStrategySchema>;

export type TableColumnKey = (typeof TABLE_COLUMN_KEYS)[number];

export type CompareFieldKey = (typeof COMPARE_FIELD_KEYS)[number];

export type ImportField = (typeof IMPORT_FIELDS)[number];

export type SourceKind = (typeof SOURCE_KINDS)[number];

export type SettingsTab =
  | 'account'
  | 'users'
  | 'data'
  | 'fields'
  | 'reference'
  | 'display'
  | 'import-rules'
  | 'assistant'
  | 'activity';

export interface SettingsTabConfig {
  id: SettingsTab;
  label: string;
  icon: LucideIcon;
  adminOnly: boolean;
}
