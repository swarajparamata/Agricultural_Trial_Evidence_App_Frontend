import type { ComponentProps } from 'react';
import { FIELD_CONTROL_CLASSES } from '@/constants';
import { cn } from '@/utils';

export type SelectOption = string | { value: string; label: string };

type SelectProps = Omit<ComponentProps<'select'>, 'children'> & {
  options: readonly SelectOption[];
  /** Label of an extra empty-value option rendered first, e.g. "All Crops". */
  placeholder?: string;
};

export const Select = ({ options, placeholder, className, ...props }: SelectProps) => (
  <select className={cn(FIELD_CONTROL_CLASSES, className)} {...props}>
    {placeholder !== undefined && <option value="">{placeholder}</option>}
    {options.map((option) => {
      const { value, label } = typeof option === 'string' ? { value: option, label: option } : option;
      return (
        <option key={value} value={value}>
          {label}
        </option>
      );
    })}
  </select>
);
