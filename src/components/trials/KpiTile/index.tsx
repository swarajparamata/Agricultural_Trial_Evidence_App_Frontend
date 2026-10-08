import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/utils';

interface KpiTileProps {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  /** Status icon shown next to the value; the label still carries the meaning. */
  icon?: LucideIcon;
  iconClassName?: string;
  className?: string;
}

/** Stat tile: a label, one value in proportional figures and a short qualifier. */
export const KpiTile = ({ label, value, detail, icon: Icon, iconClassName, className }: KpiTileProps) => (
  <div className={cn('rounded-xl border border-stone-200 bg-white p-4 shadow-xs', className)}>
    <p className="text-xs font-medium text-stone-500">{label}</p>
    <p className="mt-1 flex items-center gap-1.5 text-2xl font-semibold text-stone-900">
      {Icon && <Icon size={18} className={cn('shrink-0', iconClassName)} aria-hidden="true" />}
      {value}
    </p>
    {detail && <p className="mt-0.5 text-xs text-stone-500">{detail}</p>}
  </div>
);
