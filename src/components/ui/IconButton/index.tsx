import type { LucideIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/utils';

const VARIANT_CLASSES = {
  muted: 'p-2 text-stone-400 hover:bg-stone-200 hover:text-stone-700',
  inverse: 'text-emerald-400 hover:text-white',
  avatar: 'bg-emerald-800/50 p-2 text-emerald-200 hover:bg-emerald-800 hover:text-white',
} as const;

type IconButtonProps = Omit<ComponentProps<'button'>, 'children'> & {
  icon: LucideIcon;
  /** Accessible name – the button has no visible text. */
  label: string;
  iconSize?: number;
  variant?: keyof typeof VARIANT_CLASSES;
};

export const IconButton = ({
  icon: Icon,
  label,
  iconSize = 20,
  variant = 'muted',
  type = 'button',
  className,
  ...props
}: IconButtonProps) => (
  <button
    type={type}
    aria-label={label}
    className={cn(
      'inline-flex items-center justify-center rounded-full transition-colors',
      VARIANT_CLASSES[variant],
      className,
    )}
    {...props}
  >
    <Icon size={iconSize} aria-hidden="true" />
  </button>
);
