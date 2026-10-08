import { useAtomValue } from 'jotai';
import { BADGE_COLOR_CLASSES } from '@/constants';
import { settingsAtom } from '@/hooks';
import { cn, trialTypeColor, trialTypeDescription } from '@/utils';

const VARIANT_CLASSES = {
  /** Outlined pill used in the trials table. */
  pill: 'rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap',
  /** Compact uppercase tag used on cards. */
  tag: 'rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase',
} as const;

interface TrialTypeBadgeProps {
  type: string | null;
  variant?: keyof typeof VARIANT_CLASSES;
}

/** Trial type in the colour configured under Settings → Reference data. */
export const TrialTypeBadge = ({ type, variant = 'pill' }: TrialTypeBadgeProps) => {
  const settings = useAtomValue(settingsAtom);
  if (!type) return <span className="text-stone-400">–</span>;
  const color = trialTypeColor(settings, type);
  return (
    <span
      title={trialTypeDescription(settings, type) || undefined}
      className={cn(VARIANT_CLASSES[variant], BADGE_COLOR_CLASSES[color][variant])}
    >
      {type}
    </span>
  );
};
