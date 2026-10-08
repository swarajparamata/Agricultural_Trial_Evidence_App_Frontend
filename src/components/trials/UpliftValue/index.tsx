import type { Trial } from '@/types';
import { cn, fmtPct, missingUpliftReason } from '@/utils';

interface UpliftValueProps {
  trial: Trial;
  className?: string;
}

/** Uplift vs control with its sign; conflicting sources add the possible range underneath. */
export const UpliftValue = ({ trial, className }: UpliftValueProps) => {
  if (trial.uplift_pct === null) {
    return (
      <span
        className={cn('text-xs text-stone-400 italic', className)}
        title={`Uplift unavailable: ${missingUpliftReason(trial)}`}
      >
        n/a
      </span>
    );
  }
  const tone =
    Math.round(trial.uplift_pct * 10) === 0
      ? 'text-stone-600'
      : trial.uplift_pct > 0
        ? 'text-emerald-700'
        : 'text-red-700';
  return (
    <span className={cn('inline-flex flex-col leading-tight', className)}>
      <span className={cn('font-mono font-semibold', tone)}>{fmtPct(trial.uplift_pct)}</span>
      {trial.uplift_range && (
        <span className="text-[10px] text-stone-500" title="Range allowed by the conflicting source values">
          {fmtPct(trial.uplift_range[0])} to {fmtPct(trial.uplift_range[1])}
        </span>
      )}
    </span>
  );
};
