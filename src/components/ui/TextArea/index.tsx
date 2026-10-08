import type { ComponentProps } from 'react';
import { FIELD_CONTROL_CLASSES } from '@/constants';
import { cn } from '@/utils';

export const TextArea = ({ className, ...props }: ComponentProps<'textarea'>) => (
  <textarea className={cn(FIELD_CONTROL_CLASSES, className)} {...props} />
);
