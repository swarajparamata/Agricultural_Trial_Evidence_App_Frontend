import type { LucideIcon } from 'lucide-react';
import { z } from 'zod';
import { TRIAL_STATUSES } from '@/constants';

export const TrialStatusSchema = z.enum(TRIAL_STATUSES);

export type TrialStatus = z.infer<typeof TrialStatusSchema>;

export type CoreTrialField =
  'crop' | 'product' | 'country' | 'year' | 'trial_type' | 'treatment_yield' | 'control_yield';

export const CustomFieldValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export type CustomFieldValue = z.infer<typeof CustomFieldValueSchema>;

export const ConflictCandidateSchema = z.object({
  /** Yields are in the display unit; other fields carry their canonical value. */
  value: z.unknown(),
  display: z.string(),
  sources: z.array(z.string()),
});

export const TrialConflictSchema = z.object({
  field: z.string(),
  label: z.string(),
  status: z.enum(['open', 'resolved']),
  candidates: z.array(ConflictCandidateSchema),
  chosen_display: z.string().nullish(),
  resolved_by: z.string().nullish(),
  note: z.string().default(''),
});

export const SourceRefSchema = z.object({
  file: z.string(),
  kind: z.string(),
  locator: z.string().nullish(),
  /** Values exactly as this source reported them, e.g. "7800 kg/ha" or "HARVESTPLUS". */
  values: z.record(z.string(), z.string()).default({}),
  extraction: z.string().default('rules'),
});

export const TrialNoteSchema = z.object({ source: z.string(), text: z.string() });

/** A trial as the backend reconciles it from all its sources. Yields are in the display unit. */
export const TrialSchema = z.object({
  id: z.string(),
  crop: z.string().nullable(),
  product: z.string().nullable(),
  country: z.string().nullable(),
  year: z.number().int().nullable(),
  trial_type: z.string().nullable(),
  treatment_yield: z.number().nullable(),
  control_yield: z.number().nullable(),
  yield_unit: z.string(),
  yield_difference: z.number().nullable(),
  uplift_pct: z.number().nullable(),
  /** Lowest and highest uplift the conflicting source values allow. */
  uplift_range: z.tuple([z.number(), z.number()]).nullable(),
  status: TrialStatusSchema,
  caveats: z.array(z.string()),
  conflicts: z.array(TrialConflictSchema),
  missing_fields: z.array(z.string()),
  sources: z.array(SourceRefSchema),
  notes: z.array(TrialNoteSchema),
  custom_fields: z.record(z.string(), CustomFieldValueSchema),
  overridden_fields: z.array(z.string()),
  origin: z.enum(['ingested', 'manual']),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Trial = z.infer<typeof TrialSchema>;

export type TrialConflict = z.infer<typeof TrialConflictSchema>;

export type SourceRef = z.infer<typeof SourceRefSchema>;

export const TrialListSchema = z.object({ items: z.array(TrialSchema), total: z.number(), unit: z.string() });

export const SourceRecordSchema = z.object({
  id: z.number(),
  file: z.string(),
  kind: z.string(),
  locator: z.string(),
  fields: z.record(z.string(), z.string()),
  units: z.record(z.string(), z.string()),
  raw: z.record(z.string(), z.unknown()),
  notes: z.string(),
  extraction: z.string(),
  created_by: z.string(),
  created_at: z.string(),
});

export const TrialOverrideSchema = z.object({
  field: z.string(),
  value: z.unknown(),
  display: z.string(),
  note: z.string(),
  updated_by: z.string(),
  updated_at: z.string(),
});

export const TrialDetailSchema = TrialSchema.extend({
  records: z.array(SourceRecordSchema),
  overrides: z.array(TrialOverrideSchema),
});

export type TrialDetail = z.infer<typeof TrialDetailSchema>;

/** Body of "Add trial" (POST /trials). Yields are in `yield_unit`. */
export interface TrialInput {
  id: string;
  crop: string;
  product: string;
  country: string;
  year: number;
  trial_type: string;
  treatment_yield: number;
  control_yield: number | null;
  yield_unit: string;
  notes: string;
  custom_fields: Record<string, CustomFieldValue>;
}

/** Body of "Edit trial" (PATCH /trials/{id}); null reverts a field to its source value. */
export type TrialUpdateInput = Partial<Omit<TrialInput, 'id'>> & { reason?: string };

export type StatusTone = 'good' | 'warning' | 'serious' | 'critical' | 'neutral';

export interface StatusMeta {
  label: string;
  description: string;
  tone: StatusTone;
  icon: LucideIcon;
}

/** How the "Add New Trial" dialog adds trials: a form, or the import of spreadsheets and reports. */
export type AddTrialMethod = 'manual' | 'files';

export interface AddTrialMethodConfig {
  id: AddTrialMethod;
  label: string;
  icon: LucideIcon;
}
