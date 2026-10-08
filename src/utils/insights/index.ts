import type { BarDatum, Trial } from '@/types';
import { naturalCompare, plural } from '../format';
import { openConflicts } from '../trials';

export interface InsightKpis {
  trials: number;
  products: number;
  sources: number;
  trialsWithUplift: number;
  meanUplift: number | null;
  openConflicts: number;
  incomplete: number;
  singleSource: number;
}

const mean = (values: readonly number[]): number | null =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;

export const insightKpis = (trials: readonly Trial[]): InsightKpis => {
  const uplifts = trials.flatMap((trial) => (trial.uplift_pct === null ? [] : [trial.uplift_pct]));
  return {
    trials: trials.length,
    products: new Set(trials.map((trial) => trial.product).filter(Boolean)).size,
    sources: new Set(
      trials.flatMap((trial) =>
        trial.sources.filter((source) => source.kind !== 'manual').map((source) => source.file),
      ),
    ).size,
    trialsWithUplift: uplifts.length,
    meanUplift: mean(uplifts),
    openConflicts: trials.reduce((count, trial) => count + openConflicts(trial).length, 0),
    incomplete: trials.filter((trial) => trial.status === 'incomplete').length,
    singleSource: trials.filter((trial) => trial.status === 'single_source').length,
  };
};

export type InsightGroup = 'product' | 'crop' | 'country' | 'trial_type';

/** Mean uplift per group, sorted by name; groups without any control yield have no value. */
export const upliftByGroup = (trials: readonly Trial[], key: InsightGroup): BarDatum[] => {
  const groups = new Map<string, Trial[]>();
  for (const trial of trials) {
    const name = trial[key] ?? 'Unknown';
    groups.set(name, [...(groups.get(name) ?? []), trial]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => naturalCompare(a, b))
    .map(([label, members]) => {
      const uplifts = members.flatMap((trial) => (trial.uplift_pct === null ? [] : [trial.uplift_pct]));
      return {
        label,
        value: mean(uplifts),
        detail: `${uplifts.length} of ${plural(members.length, 'trial')} with a control`,
      };
    });
};
