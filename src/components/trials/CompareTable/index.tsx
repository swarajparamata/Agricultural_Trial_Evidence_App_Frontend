import type { CompareRow, Trial } from '@/types';
import { cn, describeTrial } from '@/utils';

interface CompareTableProps {
  trials: readonly Trial[];
  rows: readonly CompareRow[];
  highlightDifferences: boolean;
}

/** Field-by-field comparison; rows whose values differ between the trials are highlighted. */
export const CompareTable = ({ trials, rows, highlightDifferences }: CompareTableProps) => (
  <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
    <table className="w-full text-left text-sm">
      <thead className="border-b border-stone-200 bg-stone-50">
        <tr>
          <th scope="col" className="w-44 p-3 text-xs font-semibold uppercase text-stone-500">
            Field
          </th>
          {trials.map((trial) => (
            <th key={trial.id} scope="col" className="min-w-40 p-3 align-bottom">
              <span className="block text-xs font-bold uppercase tracking-wider text-stone-400">
                {trial.id}
              </span>
              <span className="block font-semibold text-emerald-900">{describeTrial(trial)}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const highlighted = highlightDifferences && row.differs;
          return (
            <tr
              key={row.key}
              className={cn('border-b border-stone-100 last:border-0', highlighted && 'bg-amber-50/60')}
            >
              <th scope="row" className="p-3 text-left text-xs font-semibold text-stone-500">
                {row.label}
                {highlighted && <span className="ml-1.5 font-normal text-amber-700">differs</span>}
              </th>
              {trials.map((trial) => (
                <td
                  key={trial.id}
                  className={cn(
                    'p-3 align-top text-stone-700',
                    ['treatment_yield', 'control_yield', 'yield_difference', 'uplift_pct'].includes(
                      row.key,
                    ) && 'font-mono',
                    row.key === 'caveats' && 'text-xs leading-relaxed',
                  )}
                >
                  {row.values[trial.id]}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
