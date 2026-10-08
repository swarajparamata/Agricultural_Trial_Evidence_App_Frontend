import type { ReactNode } from 'react';
import { cn } from '@/utils';

const TONE_CLASSES = {
  neutral: 'border-stone-200 bg-stone-50 text-stone-600',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  sky: 'border-sky-200 bg-sky-50 text-sky-800',
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
  red: 'border-red-200 bg-red-50 text-red-700',
  violet: 'border-violet-200 bg-violet-50 text-violet-700',
} as const;

interface BadgeProps {
  tone?: keyof typeof TONE_CLASSES;
  title?: string;
  className?: string;
  children: ReactNode;
}

export const Badge = ({ tone = 'neutral', title, className, children }: BadgeProps) => (
  <span
    title={title}
    className={cn(
      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
      TONE_CLASSES[tone],
      className,
    )}
  >
    {children}
  </span>
);
