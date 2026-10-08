import { Plus, Trash2 } from 'lucide-react';
import { Button, IconButton, TagInput, TextInput } from '@/components/ui';
import type { UnitEntry } from '@/types';

interface UnitsEditorProps {
  units: readonly UnitEntry[];
  onChange: (units: UnitEntry[]) => void;
}

/** Yield units and how many kg/ha one unit is, so values from different files can be compared. */
export const UnitsEditor = ({ units, onChange }: UnitsEditorProps) => {
  const update = (index: number, patch: Partial<UnitEntry>) =>
    onChange(units.map((unit, i) => (i === index ? { ...unit, ...patch } : unit)));

  return (
    <section className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-stone-800">Yield units</h3>
          <p className="text-xs text-stone-500">
            Every yield is converted through kg/ha (1 t/ha = 1000 kg/ha).
          </p>
        </div>
        <Button
          size="xs"
          variant="outline"
          onClick={() => onChange([...units, { unit: '', to_kg_per_ha: 1, aliases: [] }])}
        >
          <Plus size={13} aria-hidden="true" /> Add unit
        </Button>
      </div>
      <ul className="space-y-2">
        {units.map((unit, index) => (
          <li
            key={index}
            className="grid grid-cols-1 items-start gap-2 rounded-lg border border-stone-200 p-2 sm:grid-cols-[7rem_9rem_minmax(0,1fr)_auto]"
          >
            <TextInput
              aria-label="Unit"
              value={unit.unit}
              placeholder="t/ha"
              onChange={(event) => update(index, { unit: event.target.value })}
              className="font-mono"
            />
            <label className="flex items-center gap-1.5 text-xs text-stone-500">
              =
              <TextInput
                aria-label={`kg/ha in one ${unit.unit || 'unit'}`}
                type="number"
                min={0}
                step="any"
                value={String(unit.to_kg_per_ha)}
                onChange={(event) => update(index, { to_kg_per_ha: Number(event.target.value) })}
                className="font-mono"
              />
              kg/ha
            </label>
            <TagInput
              aria-label={`Other spellings of ${unit.unit || 'the unit'}`}
              values={unit.aliases}
              onChange={(aliases) => update(index, { aliases })}
              placeholder="e.g. kg per ha, kg ha-1"
            />
            <IconButton
              icon={Trash2}
              iconSize={16}
              label={`Remove ${unit.unit || 'unit'}`}
              onClick={() => onChange(units.filter((_, i) => i !== index))}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};
