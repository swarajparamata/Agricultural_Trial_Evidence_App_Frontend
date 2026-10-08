import { X } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import { cn } from '@/utils';

interface TagInputProps {
  id?: string;
  values: readonly string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  className?: string;
}

/** Editable list of short values (aliases, options): Enter or comma adds, Backspace removes the last. */
export const TagInput = ({ id, values, onChange, placeholder, className, ...aria }: TagInputProps) => {
  const [draft, setDraft] = useState('');

  const add = (raw: string) => {
    const next = [...values];
    for (const part of raw
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)) {
      if (!next.some((value) => value.toLowerCase() === part.toLowerCase())) next.push(part);
    }
    if (next.length !== values.length) onChange(next);
    setDraft('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      add(draft);
    } else if (event.key === 'Backspace' && draft === '' && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div
      className={cn(
        'flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-stone-300 bg-stone-50 px-2 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500',
        className,
      )}
    >
      {values.map((value) => (
        <span
          key={value}
          className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-xs font-medium text-stone-700 shadow-xs ring-1 ring-stone-200"
        >
          {value}
          <button
            type="button"
            onClick={() => onChange(values.filter((existing) => existing !== value))}
            aria-label={`Remove ${value}`}
            className="rounded-sm text-stone-400 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-emerald-500"
          >
            <X size={12} aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => draft.trim() && add(draft)}
        placeholder={values.length === 0 ? placeholder : undefined}
        className="min-w-24 flex-1 bg-transparent p-1 text-sm text-stone-900 outline-hidden placeholder:text-stone-400"
        {...aria}
      />
    </div>
  );
};
