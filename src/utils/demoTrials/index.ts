import type { AppSettings, Trial, TrialInput, VocabularyEntry } from '@/types';

const key = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Canonical spelling of a vocabulary value ("HARVESTPLUS" -> "Harvest Plus"), or the input tidied. */
const canonical = (entries: readonly (VocabularyEntry & { code?: string | null })[], raw: string): string => {
  const wanted = key(raw);
  const match = entries.find((entry) =>
    [entry.name, ...entry.aliases, entry.code ?? ''].some((spelling) => spelling && key(spelling) === wanted),
  );
  return match?.name ?? raw.trim();
};

/**
 * A manual trial as the backend would reconcile it, for the offline demo (no API to ask).
 * Yields are converted to the display unit and the uplift is derived the same way.
 */
export const buildDemoTrial = (input: TrialInput, settings: AppSettings, actor: string): Trial => {
  const { units } = settings.reference_data;
  const factor = (unit: string) => units.find((entry) => entry.unit === unit)?.to_kg_per_ha ?? 1;
  const decimals = settings.display.decimals;
  const toDisplay = (value: number | null) =>
    value === null
      ? null
      : Number(((value * factor(input.yield_unit)) / factor(settings.display.yield_unit)).toFixed(decimals));
  const treated = toDisplay(input.treatment_yield);
  const control = toDisplay(input.control_yield);
  const uplift =
    input.control_yield !== null && input.control_yield > 0
      ? Number((((input.treatment_yield - input.control_yield) / input.control_yield) * 100).toFixed(1))
      : null;
  const now = new Date().toISOString();
  const missingControl = input.control_yield === null;

  return {
    id: input.id.replace(/\s+/g, '').toUpperCase(),
    crop: canonical(settings.reference_data.crops, input.crop),
    product: canonical(settings.reference_data.products, input.product),
    country: canonical(settings.reference_data.countries, input.country),
    year: input.year,
    trial_type: canonical(settings.reference_data.trial_types, input.trial_type),
    treatment_yield: treated,
    control_yield: control,
    yield_unit: settings.display.yield_unit,
    yield_difference:
      treated !== null && control !== null ? Number((treated - control).toFixed(decimals)) : null,
    uplift_pct: uplift,
    uplift_range: null,
    status: missingControl ? 'incomplete' : 'manual',
    caveats: [
      ...(missingControl ? ['Control yield missing – uplift cannot be calculated'] : []),
      'Entered manually, no source document',
    ],
    conflicts: [],
    missing_fields: missingControl ? ['control_yield'] : [],
    sources: [
      {
        file: 'Manual entry',
        kind: 'manual',
        locator: `entered by ${actor} (offline demo)`,
        values: {},
        extraction: 'manual',
      },
    ],
    notes: input.notes ? [{ source: 'Manual entry', text: input.notes }] : [],
    custom_fields: Object.fromEntries(
      Object.entries(input.custom_fields).filter(([, value]) => value !== null),
    ),
    overridden_fields: [],
    origin: 'manual',
    created_at: now,
    updated_at: now,
  };
};
