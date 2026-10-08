import type { ComponentProps } from 'react';
import { FIELD_CONTROL_CLASSES } from '@/constants';
import { cn } from '@/utils';

export const TextInput = ({ className, ...props }: ComponentProps<'input'>) => (
  <input className={cn(FIELD_CONTROL_CLASSES, className)} {...props} />
);
