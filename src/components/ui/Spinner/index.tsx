import { LoaderCircle } from 'lucide-react';
import { cn } from '@/utils';

interface SpinnerProps {
  label?: string;
  size?: number;
  className?: string;
}

export const Spinner = ({ label = 'Loading…', size = 16, className }: SpinnerProps) => (
  <span role="status" className={cn('inline-flex items-center gap-2 text-sm text-stone-500', className)}>
    <LoaderCircle size={size} className="animate-spin" aria-hidden="true" />
    <span>{label}</span>
  </span>
);
