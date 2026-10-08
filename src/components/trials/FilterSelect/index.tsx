import { useId } from 'react';
import { Label, Select, type SelectOption } from '@/components/ui';

interface FilterSelectProps {
  label: string;
  /** Label of the "no filter" option, e.g. "All Crops". */
  allLabel: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
}

export const FilterSelect = ({ label, allLabel, value, options, onChange }: FilterSelectProps) => {
  const id = useId();

  return (
    <div className="flex min-w-36 flex-1 flex-col">
      <Label htmlFor={id} className="mb-1.5">
        {label}
      </Label>
      <Select
        id={id}
        value={value}
        options={options}
        placeholder={allLabel}
        onChange={(event) => onChange(event.target.value)}
        className="cursor-pointer transition-all hover:bg-stone-100 focus:border-emerald-500"
      />
    </div>
  );
};
