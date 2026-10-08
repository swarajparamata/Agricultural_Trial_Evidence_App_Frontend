import { useAtomValue } from 'jotai';
import { GitCompare, Trophy } from 'lucide-react';
import { ChartFrame, DumbbellChart, HBarChart, UpliftChart } from '@/components/charts';
import { Modal, Notice } from '@/components/ui';
import { CHART_COLORS } from '@/constants';
import { isCompareModalOpenAtom, selectedTrialsAtom, settingsAtom, useDisclosure } from '@/hooks';
import type { AppSettings, Trial } from '@/types';
import {
  compareRows,
  compareSummary,
  compareWarnings,
  customChartData,
  describeTrial,
  dumbbellFacets,
  fmtNum,
  fmtPct,
  fmtYield,
  upliftData,
} from '@/utils';
import { CompareTable } from '../CompareTable';
import { KpiTile } from '../KpiTile';

const CompareView = ({ trials, settings }: { trials: readonly Trial[]; settings: AppSettings }) => {
  const comparison = settings.comparison;
  const summary = compareSummary(trials);
  const { highest } = summary;
  const leader = highest?.ids.length === 1 ? trials.find((trial) => trial.id === highest.ids[0]) : undefined;
  const warnings = compareWarnings(trials);
  const uplift = upliftData(trials);
  const facets = dumbbellFacets(trials);
  const hasAlternatives = facets.some((facet) =>
    facet.rows.some((row) => row.treatedAlternatives.length + row.controlAlternatives.length > 0),
  );
  const decimals = settings.display.decimals;
  const customCharts = comparison.show_custom_charts
    ? settings.custom_fields.fields.filter(
        (definition) =>
          definition.chartable &&
          trials.some((trial) => typeof trial.custom_fields[definition.key] === 'number'),
      )
    : [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiTile
          label="Mean uplift"
          value={fmtPct(summary.meanUplift)}
          detail={`${summary.trialsWithUplift} of ${summary.trialCount} trials have a control yield`}
        />
        <KpiTile
          label="Highest uplift"
          icon={Trophy}
          iconClassName="text-amber-500"
          value={highest ? `${leader ? `${leader.id} ` : ''}${fmtPct(highest.uplift)}` : '–'}
          detail={
            !highest
              ? 'no uplift available'
              : leader
                ? describeTrial(leader)
                : `Tied: ${highest.ids.join(', ')}`
          }
        />
        <KpiTile label="Crops" value={summary.crops.length} detail={summary.crops.join(', ') || '–'} />
      </div>

      {warnings.length > 0 && (
        <Notice tone="warning" title="Read before comparing">
          <ul className="list-disc space-y-0.5 pl-4">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </Notice>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {comparison.show_uplift_chart && (
          <ChartFrame
            title="Yield uplift vs control"
            subtitle="(treated − control) ÷ control; whiskers show the range conflicting sources allow"
            table={{
              columns: ['Trial', 'Uplift', 'Range from conflicting sources'],
              rows: uplift.map((datum) => [
                `${datum.id} · ${datum.sublabel}`,
                datum.value === null ? `n/a (${datum.missingReason})` : fmtPct(datum.value),
                datum.range ? `${fmtPct(datum.range[0])} to ${fmtPct(datum.range[1])}` : '–',
              ]),
            }}
          >
            <UpliftChart data={uplift} />
          </ChartFrame>
        )}

        {comparison.show_yield_chart && (
          <ChartFrame
            title="Treated vs control yield"
            subtitle={
              facets.length > 1 ? 'One axis per crop – their yields are on different scales' : undefined
            }
            legend={[
              { label: 'Control', color: CHART_COLORS.control, shape: 'dot' },
              { label: 'Treated', color: CHART_COLORS.treated, shape: 'dot' },
              ...(hasAlternatives
                ? [{ label: 'Other source value', color: CHART_COLORS.treated, shape: 'ring' as const }]
                : []),
            ]}
            table={{
              columns: ['Trial', 'Crop', 'Control', 'Treated', 'Uplift'],
              rows: trials.map((trial) => [
                trial.id,
                trial.crop ?? '–',
                fmtYield(trial.control_yield, trial.yield_unit, decimals),
                fmtYield(trial.treatment_yield, trial.yield_unit, decimals),
                fmtPct(trial.uplift_pct),
              ]),
            }}
          >
            <DumbbellChart facets={facets} />
          </ChartFrame>
        )}

        {comparison.show_difference_chart && (
          <ChartFrame
            title="Treated minus control"
            subtitle={`Absolute difference in ${settings.display.yield_unit}${summary.crops.length > 1 ? ' – compare within a crop only' : ''}`}
            table={{
              columns: ['Trial', 'Difference'],
              rows: trials.map((trial) => [
                trial.id,
                fmtYield(trial.yield_difference, trial.yield_unit, decimals),
              ]),
            }}
          >
            <HBarChart
              data={trials.map((trial) => ({
                label: trial.id,
                value: trial.yield_difference,
                detail: describeTrial(trial),
              }))}
              formatValue={(value) => `${value > 0 ? '+' : ''}${fmtNum(value, decimals)}`}
              polarity
              ariaLabel="Treated minus control yield per trial"
              valueLabel={settings.display.yield_unit}
              labelWidth={64}
            />
          </ChartFrame>
        )}

        {customCharts.map((definition) => (
          <ChartFrame
            key={definition.key}
            title={definition.label}
            subtitle={definition.unit ? `in ${definition.unit}` : undefined}
            table={{
              columns: ['Trial', definition.label],
              rows: trials.map((trial) => {
                const value = trial.custom_fields[definition.key];
                return [trial.id, typeof value === 'number' ? fmtNum(value, decimals) : '–'];
              }),
            }}
          >
            <HBarChart
              data={customChartData(trials, definition)}
              formatValue={(value) => fmtNum(value, decimals)}
              ariaLabel={`${definition.label} per trial`}
              valueLabel={definition.unit ?? definition.label}
              labelWidth={64}
            />
          </ChartFrame>
        ))}
      </div>

      <CompareTable
        trials={trials}
        rows={compareRows(trials, settings)}
        highlightDifferences={comparison.highlight_differences}
      />
    </div>
  );
};

export const CompareModal = () => {
  const { isOpen, close } = useDisclosure(isCompareModalOpenAtom);
  const trials = useAtomValue(selectedTrialsAtom);
  const settings = useAtomValue(settingsAtom);

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      size="xl"
      titleClassName="text-emerald-900"
      bodyClassName="bg-stone-100/50"
      title={
        <>
          <GitCompare size={22} className="text-emerald-600" aria-hidden="true" />
          Trial Comparison
        </>
      }
      subtitle={trials.map((trial) => trial.id).join(' · ')}
    >
      {isOpen && trials.length > 0 && <CompareView trials={trials} settings={settings} />}
    </Modal>
  );
};
