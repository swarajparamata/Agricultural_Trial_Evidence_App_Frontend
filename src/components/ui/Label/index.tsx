import type { ComponentProps } from 'react';
import { cn } from '@/utils';

export const Label = ({ className, ...props }: ComponentProps<'label'>) => (
  <label className={cn('block text-xs font-semibold uppercase text-stone-500', className)} {...props} />
);
