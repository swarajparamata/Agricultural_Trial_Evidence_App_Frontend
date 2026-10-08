import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/utils';

const TONES: Record<'info' | 'success' | 'warning' | 'error', { classes: string; icon: LucideIcon }> = {
  info: { classes: 'border-sky-200 bg-sky-50 text-sky-900', icon: Info },
  success: { classes: 'border-emerald-200 bg-emerald-50 text-emerald-900', icon: CircleCheck },
  warning: { classes: 'border-amber-200 bg-amber-50 text-amber-900', icon: TriangleAlert },
  error: { classes: 'border-red-200 bg-red-50 text-red-800', icon: CircleAlert },
};

interface NoticeProps {
  tone?: keyof typeof TONES;
  title?: ReactNode;
  children?: ReactNode;
  /** Buttons shown under the text. */
  actions?: ReactNode;
  className?: string;
}

/** Inline message box; errors are announced to screen readers. */
export const Notice = ({ tone = 'info', title, children, actions, className }: NoticeProps) => {
  const { classes, icon: Icon } = TONES[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex gap-2.5 rounded-lg border p-3 text-sm', classes, className)}
    >
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1 space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="leading-relaxed">{children}</div>}
        {actions && <div className="flex flex-wrap gap-2 pt-1">{actions}</div>}
      </div>
    </div>
  );
};
