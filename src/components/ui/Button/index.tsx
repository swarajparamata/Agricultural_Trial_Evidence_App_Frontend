import type { ComponentProps } from 'react';
import { cn } from '@/utils';

const VARIANT_CLASSES = {
  primary: 'bg-emerald-600 text-white shadow-xs enabled:hover:bg-emerald-500 disabled:opacity-60',
  secondary:
    'border border-emerald-200 bg-emerald-100 text-emerald-800 shadow-xs enabled:hover:bg-emerald-200 disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-400',
  outline:
    'border border-stone-300 bg-white text-stone-700 shadow-xs enabled:hover:bg-stone-50 disabled:opacity-50',
  dark: 'bg-stone-800 text-white shadow-xs enabled:hover:bg-stone-700 disabled:opacity-60',
  danger: 'bg-red-600 text-white shadow-xs enabled:hover:bg-red-500 disabled:opacity-60',
  ghost: 'text-stone-600 enabled:hover:bg-stone-100 disabled:opacity-50',
  subtle:
    'border border-transparent text-stone-500 hover:border-stone-200 hover:bg-stone-100 hover:text-stone-800',
  link: 'font-semibold text-emerald-700 hover:underline disabled:opacity-50',
} as const;

const SIZE_CLASSES = {
  none: '',
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-4 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-2.5 text-sm',
} as const;

type ButtonProps = ComponentProps<'button'> & {
  variant?: keyof typeof VARIANT_CLASSES;
  size?: keyof typeof SIZE_CLASSES;
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className,
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed',
      VARIANT_CLASSES[variant],
      SIZE_CLASSES[size],
      className,
    )}
    {...props}
  />
);
