import { ArrowDown, ArrowUp } from 'lucide-react';
import { IconButton } from '@/components/ui';

interface ColumnPickerProps<Key extends string> {
  all: readonly Key[];
  selected: readonly Key[];
  labels: Record<Key, string>;
  onChange: (selected: Key[]) => void;
  /** Always shown and not removable (e.g. the trial ID column). */
  locked?: readonly Key[];
}

/** Choose and order columns: shown ones first in their order, hidden ones after. */
export const ColumnPicker = <Key extends string>({
  all,
  selected,
  labels,
  onChange,
  locked = [],
}: ColumnPickerProps<Key>) => {
  const hidden = all.filter((key) => !selected.includes(key));

  const moveBy = (index: number, offset: number) => {
    const next = [...selected];
    const [item] = next.splice(index, 1);
    next.splice(index + offset, 0, item);
    onChange(next);
  };

  return (
    <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200">
      {selected.map((key, index) => (
        <li key={key} className="flex items-center justify-between gap-2 px-3 py-1.5">
          <label className="flex items-center gap-2 text-sm text-stone-800">
            <input
              type="checkbox"
              checked
              disabled={locked.includes(key)}
              onChange={() => onChange(selected.filter((item) => item !== key))}
              className="size-4 accent-emerald-600"
            />
            {labels[key]}
          </label>
          <span className="flex items-center">
            <IconButton
              icon={ArrowUp}
              iconSize={14}
              label={`Move ${labels[key]} up`}
              disabled={index === 0}
              onClick={() => moveBy(index, -1)}
            />
            <IconButton
              icon={ArrowDown}
              iconSize={14}
              label={`Move ${labels[key]} down`}
              disabled={index === selected.length - 1}
              onClick={() => moveBy(index, 1)}
            />
          </span>
        </li>
      ))}
      {hidden.map((key) => (
        <li key={key} className="px-3 py-1.5">
          <label className="flex items-center gap-2 text-sm text-stone-500">
            <input
              type="checkbox"
              checked={false}
              onChange={() => onChange([...selected, key])}
              className="size-4 accent-emerald-600"
            />
            {labels[key]}
          </label>
        </li>
      ))}
    </ul>
  );
};
