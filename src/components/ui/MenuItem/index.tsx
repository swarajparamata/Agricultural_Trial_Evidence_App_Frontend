import type { ComponentProps } from 'react';
import { cn } from '@/utils';

const TONE_CLASSES = {
  default: 'text-stone-700 hover:bg-emerald-50',
  danger: 'font-medium text-red-600 hover:bg-red-50',
} as const;

type MenuItemProps = ComponentProps<'button'> & {
  tone?: keyof typeof TONE_CLASSES;
};

export const MenuItem = ({ tone = 'default', type = 'button', className, ...props }: MenuItemProps) => (
  <button
    type={type}
    role="menuitem"
    className={cn('block w-full px-4 py-2 text-left text-sm transition-colors', TONE_CLASSES[tone], className)}
    {...props}
  />
);
