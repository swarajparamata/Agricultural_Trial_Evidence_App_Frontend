import { Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button, IconButton, TagInput, TextInput } from '@/components/ui';
import type { VocabularyEntry } from '@/types';

interface VocabularyEditorProps<Entry extends VocabularyEntry> {
  title: string;
  description?: string;
  /** Singular noun for buttons and labels, e.g. "crop". */
  noun: string;
  entries: readonly Entry[];
  onChange: (entries: Entry[]) => void;
  makeEntry: () => Entry;
  /** Extra inputs per entry (country code, badge colour…). */
  renderExtra?: (entry: Entry, update: (patch: Partial<Entry>) => void) => ReactNode;
}

/** Canonical names with the other spellings that should be read as the same value. */
export const VocabularyEditor = <Entry extends VocabularyEntry>({
  title,
  description,
  noun,
  entries,
  onChange,
  makeEntry,
  renderExtra,
}: VocabularyEditorProps<Entry>) => {
  const update = (index: number, patch: Partial<Entry>) =>
    onChange(entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));

  return (
    <section className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-stone-800">{title}</h3>
          {description && <p className="text-xs text-stone-500">{description}</p>}
        </div>
        <Button size="xs" variant="outline" onClick={() => onChange([...entries, makeEntry()])}>
          <Plus size={13} aria-hidden="true" /> Add {noun}
        </Button>
      </div>
      <ul className="space-y-2">
        {entries.map((entry, index) => (
          <li
            key={index}
            className="grid grid-cols-1 items-start gap-2 rounded-lg border border-stone-200 p-2 sm:grid-cols-[12rem_minmax(0,1fr)_auto]"
          >
            <TextInput
              aria-label={`${noun} name`}
              value={entry.name}
              placeholder={`${noun[0].toUpperCase()}${noun.slice(1)} name`}
              onChange={(event) => update(index, { name: event.target.value } as Partial<Entry>)}
              className="font-medium"
            />
            <div className="space-y-2">
              <TagInput
                aria-label={`Other spellings of ${entry.name || noun}`}
                values={entry.aliases}
                onChange={(aliases) => update(index, { aliases } as Partial<Entry>)}
                placeholder="Other spellings, e.g. abbreviations or plurals"
              />
              {renderExtra?.(entry, (patch) => update(index, patch))}
            </div>
            <IconButton
              icon={Trash2}
              iconSize={16}
              label={`Remove ${entry.name || noun}`}
              onClick={() => onChange(entries.filter((_, i) => i !== index))}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};
