import { TRIAL_STATUS_META } from '@/constants';
import type { StatusTone, TrialStatus } from '@/types';
import { cn } from '@/utils';

const TONE_CLASSES: Record<StatusTone, string> = {
  good: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  serious: 'border-orange-200 bg-orange-50 text-orange-800',
  critical: 'border-red-200 bg-red-50 text-red-700',
  neutral: 'border-stone-200 bg-stone-50 text-stone-600',
};

interface StatusBadgeProps {
  status: TrialStatus;
  className?: string;
}

/** Data-quality status: icon and label carry the meaning, the colour only reinforces it. */
export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const meta = TRIAL_STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      title={meta.description}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        TONE_CLASSES[meta.tone],
        className,
      )}
    >
      <Icon size={12} aria-hidden="true" />
      {meta.label}
    </span>
  );
};
