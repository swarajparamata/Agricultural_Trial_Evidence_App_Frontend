import { COMPARE_FIELD_LABELS, TRIAL_STATUS_META } from '@/constants';
import type {
  AlternativeValue,
  AppSettings,
  BarDatum,
  CompareFieldKey,
  CompareRow,
  CompareSummary,
  CustomFieldDefinition,
  DumbbellFacet,
  Trial,
  UpliftDatum,
} from '@/types';
import { fmtPct, fmtYield } from '../format';
import { customFieldsFor, formatCustomValue } from '../settings';
import { describeTrial, missingUpliftReason, openConflicts, sourceFiles } from '../trials';

const coreValue = (trial: Trial, key: CompareFieldKey, decimals: number): string => {
  switch (key) {
    case 'treatment_yield':
    case 'control_yield':
    case 'yield_difference':
      return fmtYield(trial[key], trial.yield_unit, decimals);
    case 'uplift_pct':
      return trial.uplift_range
        ? `${fmtPct(trial.uplift_pct)} (${fmtPct(trial.uplift_range[0])} to ${fmtPct(trial.uplift_range[1])})`
        : fmtPct(trial.uplift_pct);
    case 'status':
      return TRIAL_STATUS_META[trial.status].label;
    case 'caveats':
      return trial.caveats.join('; ') || '–';
    case 'sources':
      return sourceFiles(trial).join(', ');
    default:
      return trial[key] === null ? '–' : String(trial[key]);
  }
};

const row = (key: string, label: string, values: Record<string, string>): CompareRow => ({
  key,
  label,
  values,
  differs: new Set(Object.values(values)).size > 1,
});

/** One row per configured comparison field and per custom field shown in comparisons. */
export const compareRows = (trials: readonly Trial[], settings: AppSettings): CompareRow[] => {
  const decimals = settings.display.decimals;
  const valuesFor = (read: (trial: Trial) => string) =>
    Object.fromEntries(trials.map((trial) => [trial.id, read(trial)]));
  return [
    ...settings.comparison.fields.map((key) =>
      row(
        key,
        COMPARE_FIELD_LABELS[key],
        valuesFor((trial) => coreValue(trial, key, decimals)),
      ),
    ),
    ...customFieldsFor(settings, 'compare').map((definition) =>
      row(
        `custom:${definition.key}`,
        definition.label,
        valuesFor((trial) => formatCustomValue(definition, trial.custom_fields[definition.key], decimals)),
      ),
    ),
  ];
};

export const compareSummary = (trials: readonly Trial[]): CompareSummary => {
  const withUplift = trials.filter((trial) => trial.uplift_pct !== null);
  const uplifts = withUplift.map((trial) => trial.uplift_pct ?? 0);
  const top = uplifts.length ? Math.max(...uplifts) : null;
  const mean = uplifts.length ? uplifts.reduce((sum, value) => sum + value, 0) / uplifts.length : null;
  return {
    trialCount: trials.length,
    trialsWithUplift: withUplift.length,
    meanUplift: mean,
    // Uplifts arrive rounded to 0.1 %, so equal values are ties as the reader sees them.
    highest:
      top === null
        ? null
        : {
            ids: withUplift.filter((trial) => trial.uplift_pct === top).map((trial) => trial.id),
            uplift: top,
          },
    crops: [...new Set(trials.map((trial) => trial.crop).filter((crop): crop is string => Boolean(crop)))],
  };
};

/** Things a reader must know before drawing conclusions from the comparison. */
export const compareWarnings = (trials: readonly Trial[]): string[] => {
  const warnings: string[] = [];
  const crops = [...new Set(trials.map((trial) => trial.crop).filter(Boolean))];
  if (crops.length > 1) {
    warnings.push(
      `The trials cover different crops (${crops.join(', ')}): compare uplift %, not absolute yields.`,
    );
  }
  for (const trial of trials) {
    for (const conflict of openConflicts(trial)) {
      const values = conflict.candidates.map((c) => `${c.display} (${c.sources.join(', ')})`).join(' vs ');
      warnings.push(`${trial.id}: sources disagree on ${conflict.label.toLowerCase()} – ${values}.`);
    }
    if (trial.uplift_pct === null)
      warnings.push(`${trial.id}: ${missingUpliftReason(trial)}, so its uplift can't be calculated.`);
  }
  return warnings;
};

export const upliftData = (trials: readonly Trial[]): UpliftDatum[] =>
  trials.map((trial) => ({
    id: trial.id,
    sublabel: describeTrial(trial),
    value: trial.uplift_pct,
    range: trial.uplift_range,
    missingReason: trial.uplift_pct === null ? missingUpliftReason(trial) : undefined,
  }));

/** Values that other sources reported for a yield field while the conflict is open. */
const alternatives = (trial: Trial, field: 'treatment_yield' | 'control_yield'): AlternativeValue[] => {
  const shown = trial[field];
  return openConflicts(trial)
    .filter((conflict) => conflict.field === field)
    .flatMap((conflict) => conflict.candidates)
    .flatMap((candidate) =>
      typeof candidate.value === 'number' && candidate.value !== shown
        ? [{ value: candidate.value, sources: candidate.sources }]
        : [],
    );
};

/** Treated vs control per trial, one facet per crop so each crop gets its own yield axis. */
export const dumbbellFacets = (trials: readonly Trial[]): DumbbellFacet[] => {
  const facets = new Map<string, DumbbellFacet>();
  for (const trial of trials) {
    const crop = trial.crop ?? 'Unknown crop';
    const facet = facets.get(crop) ?? { crop, unit: trial.yield_unit, rows: [] };
    facet.rows.push({
      id: trial.id,
      sublabel: [trial.product, trial.country, trial.year].filter(Boolean).join(' · '),
      control: trial.control_yield,
      treated: trial.treatment_yield,
      uplift: trial.uplift_pct,
      controlAlternatives: alternatives(trial, 'control_yield'),
      treatedAlternatives: alternatives(trial, 'treatment_yield'),
    });
    facets.set(crop, facet);
  }
  return [...facets.values()];
};

export const customChartData = (trials: readonly Trial[], definition: CustomFieldDefinition): BarDatum[] =>
  trials.map((trial) => {
    const value = trial.custom_fields[definition.key];
    return { label: trial.id, value: typeof value === 'number' ? value : null, detail: describeTrial(trial) };
  });
