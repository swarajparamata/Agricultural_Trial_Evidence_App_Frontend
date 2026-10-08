import { Plus, Trash2 } from 'lucide-react';
import { Button, IconButton, TagInput, TextInput } from '@/components/ui';
import type { CaveatRule } from '@/types';

interface CaveatRulesEditorProps {
  rules: readonly CaveatRule[];
  onChange: (rules: CaveatRule[]) => void;
}

/** Keyword rules that turn sentences in report notes into evidence caveats. */
export const CaveatRulesEditor = ({ rules, onChange }: CaveatRulesEditorProps) => {
  const update = (index: number, patch: Partial<CaveatRule>) =>
    onChange(rules.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)));

  return (
    <section className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-stone-800">Caveat rules</h3>
          <p className="text-xs text-stone-500">
            A caveat is added when one sentence of a trial's notes contains all of the first words and at
            least one of the second (case is ignored). Example: “replicat” + “not documented”.
          </p>
        </div>
        <Button
          size="xs"
          variant="outline"
          onClick={() => onChange([...rules, { label: '', match_all: [], match_any: [] }])}
        >
          <Plus size={13} aria-hidden="true" /> Add rule
        </Button>
      </div>
      <ul className="space-y-2">
        {rules.map((rule, index) => (
          <li
            key={index}
            className="grid grid-cols-1 items-start gap-2 rounded-lg border border-stone-200 p-2 lg:grid-cols-[14rem_minmax(0,1fr)_minmax(0,1fr)_auto]"
          >
            <TextInput
              aria-label="Caveat label"
              value={rule.label}
              placeholder="Caveat shown on the trial"
              onChange={(event) => update(index, { label: event.target.value })}
            />
            <TagInput
              aria-label="Words that must all appear"
              values={rule.match_all}
              onChange={(match_all) => update(index, { match_all })}
              placeholder="All of…"
            />
            <TagInput
              aria-label="Words of which one must appear"
              values={rule.match_any}
              onChange={(match_any) => update(index, { match_any })}
              placeholder="Any of…"
            />
            <IconButton
              icon={Trash2}
              iconSize={16}
              label={`Remove ${rule.label || 'rule'}`}
              onClick={() => onChange(rules.filter((_, i) => i !== index))}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};
