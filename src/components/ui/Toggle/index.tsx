import { useId } from 'react';
import { cn } from '@/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  /** Keeps the label for screen readers only (e.g. inside a table row). */
  hideLabel?: boolean;
}

/** On/off switch with a label and an optional explanation. */
export const Toggle = ({
  checked,
  onChange,
  label,
  description,
  disabled,
  hideLabel = false,
}: ToggleProps) => {
  const id = useId();
  const descriptionId = `${id}-description`;

  return (
    <div className={cn('flex items-start gap-4 py-1', hideLabel ? 'justify-start' : 'justify-between')}>
      <div className={cn('min-w-0', hideLabel && 'sr-only')}>
        <label htmlFor={id} className="text-sm font-medium text-stone-800">
          {label}
        </label>
        {description && (
          <p id={descriptionId} className="mt-0.5 text-xs leading-relaxed text-stone-500">
            {description}
          </p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? descriptionId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-emerald-600' : 'bg-stone-300',
        )}
      >
        <span
          className={cn(
            'inline-block size-5 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-5.5' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  );
};
