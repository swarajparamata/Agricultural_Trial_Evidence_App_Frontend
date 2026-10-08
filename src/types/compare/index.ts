/** One row of the comparison table: a field and its value per trial. */
export interface CompareRow {
  key: string;
  label: string;
  values: Record<string, string>;
  differs: boolean;
}

export interface CompareSummary {
  trialCount: number;
  trialsWithUplift: number;
  meanUplift: number | null;
  /** The highest uplift and every trial that reaches it (ties are listed, not hidden). */
  highest: { ids: string[]; uplift: number } | null;
  crops: string[];
}

/** A bar of the uplift chart. `value` is null when the trial has no uplift (e.g. no control yield). */
export interface UpliftDatum {
  id: string;
  sublabel: string;
  value: number | null;
  range: readonly [number, number] | null;
  missingReason?: string;
}

/** A value another source reported for the same yield (shown as a hollow marker). */
export interface AlternativeValue {
  value: number;
  sources: string[];
}

export interface DumbbellRow {
  id: string;
  sublabel: string;
  control: number | null;
  treated: number | null;
  uplift: number | null;
  controlAlternatives: AlternativeValue[];
  treatedAlternatives: AlternativeValue[];
}

/** Treated-vs-control rows of one crop, plotted on that crop's own axis. */
export interface DumbbellFacet {
  crop: string;
  unit: string;
  rows: DumbbellRow[];
}

/** A bar of a simple single-series bar chart. */
export interface BarDatum {
  label: string;
  value: number | null;
  detail?: string;
}
