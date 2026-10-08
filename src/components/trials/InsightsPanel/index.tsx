import { useAtomValue } from 'jotai';
import { CircleAlert, CircleCheck, FileWarning } from 'lucide-react';
import { useState } from 'react';
import { ChartFrame, HBarChart } from '@/components/charts';
import { filteredTrialsAtom } from '@/hooks';
import { fmtPct, insightKpis, plural, upliftByGroup, type InsightGroup } from '@/utils';
import { KpiTile } from '../KpiTile';

const GROUPS: { value: InsightGroup; label: string }[] = [
  { value: 'product', label: 'product' },
  { value: 'crop', label: 'crop' },
  { value: 'country', label: 'country' },
  { value: 'trial_type', label: 'trial type' },
];

/** Headline numbers and mean uplift per group, for the trials that match the current filters. */
export const InsightsPanel = () => {
  const trials = useAtomValue(filteredTrialsAtom);
  const [group, setGroup] = useState<InsightGroup>('product');
  const kpis = insightKpis(trials);
  const data = upliftByGroup(trials, group);
  const groupLabel = GROUPS.find((item) => item.value === group)?.label ?? group;
  const attention = kpis.incomplete + kpis.singleSource;

  return (
    <section aria-label="Insights" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <div className="grid grid-cols-2 gap-3 self-start">
        <KpiTile
          label="Trials"
          value={kpis.trials}
          detail={`${plural(kpis.products, 'product')} · ${plural(kpis.sources, 'source file')}`}
        />
        <KpiTile
          label="Mean uplift vs control"
          value={fmtPct(kpis.meanUplift)}
          detail={`${kpis.trialsWithUplift} of ${plural(kpis.trials, 'trial')} have a control yield`}
        />
        <KpiTile
          label="Open conflicts"
          value={kpis.openConflicts}
          icon={kpis.openConflicts > 0 ? CircleAlert : CircleCheck}
          iconClassName={kpis.openConflicts > 0 ? 'text-red-600' : 'text-emerald-600'}
          detail={kpis.openConflicts > 0 ? 'sources disagree on a value' : 'all sources agree'}
        />
        <KpiTile
          label="Need attention"
          value={attention}
          icon={attention > 0 ? FileWarning : CircleCheck}
          iconClassName={attention > 0 ? 'text-amber-600' : 'text-emerald-600'}
          detail={`${kpis.incomplete} incomplete · ${kpis.singleSource} single-source`}
        />
      </div>

      <ChartFrame
        title={`Mean uplift by ${groupLabel}`}
        subtitle="Mean of per-trial uplift; trials without a control yield are left out"
        controls={
          <select
            aria-label="Group by"
            value={group}
            onChange={(event) => setGroup(event.target.value as InsightGroup)}
            className="rounded-md border border-stone-200 bg-white px-2 py-1 text-xs text-stone-700 focus-visible:outline-2 focus-visible:outline-emerald-500"
          >
            {GROUPS.map((item) => (
              <option key={item.value} value={item.value}>
                By {item.label}
              </option>
            ))}
          </select>
        }
        table={{
          columns: [groupLabel[0].toUpperCase() + groupLabel.slice(1), 'Mean uplift', 'Trials'],
          rows: data.map((datum) => [
            datum.label,
            datum.value === null ? 'no data' : fmtPct(datum.value),
            datum.detail ?? '',
          ]),
        }}
      >
        {data.length > 0 ? (
          <HBarChart
            data={data}
            formatValue={fmtPct}
            formatTick={(value) => `${Number(value.toFixed(1))}%`}
            polarity
            ariaLabel={`Mean uplift by ${groupLabel}`}
            valueLabel="mean uplift"
          />
        ) : (
          <p className="py-8 text-center text-sm text-stone-500">No trials match the filters.</p>
        )}
      </ChartFrame>
    </section>
  );
};
