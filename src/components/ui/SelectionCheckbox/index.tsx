import { Square, SquareCheckBig } from 'lucide-react';

interface SelectionCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  /** Accessible name, e.g. "Select trial T001". */
  label: string;
}

/** Icon checkbox that can live inside a clickable row without toggling twice. */
export const SelectionCheckbox = ({ checked, onToggle, label }: SelectionCheckboxProps) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    aria-label={label}
    onClick={(event) => {
      event.stopPropagation();
      onToggle();
    }}
    className="inline-flex rounded-sm align-middle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
  >
    {checked ? (
      <SquareCheckBig size={20} className="text-emerald-600" aria-hidden="true" />
    ) : (
      <Square size={20} className="text-stone-300" aria-hidden="true" />
    )}
  </button>
);
