import { useAtomValue } from 'jotai';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useId } from 'react';
import { Card, FormField, IconButton, Select, TagInput, TextInput, Toggle } from '@/components/ui';
import { CONFLICT_STRATEGY_LABELS, IMPORT_FIELD_LABELS, SOURCE_KIND_LABELS } from '@/constants';
import { settingsAtom, useSettingsSection } from '@/hooks';
import { IMPORT_FIELDS, type ConflictStrategy } from '@/types';
import { unitNames } from '@/utils';
import { CaveatRulesEditor } from '../CaveatRulesEditor';
import { SaveBar } from '../SaveBar';

const IngestionCard = () => {
  const ids = useId();
  const section = useSettingsSection('ingestion');
  const units = unitNames(useAtomValue(settingsAtom));
  const ingestion = section.draft;

  return (
    <Card
      title="Column and label names"
      description="Which CSV column headers and report labels hold each field. Matching ignores case, spaces and a unit at the end of a header (“Treated yield kg per ha” is the treated yield in kg/ha). Saving re-reads every imported file."
      footer={
        <SaveBar
          isDirty={section.isDirty}
          isSaving={section.isSaving}
          error={section.error}
          message={section.message}
          onSave={() => void section.save()}
          onDiscard={section.discard}
          onReset={() => void section.resetToDefaults()}
        />
      }
    >
      <div className="space-y-3">
        {IMPORT_FIELDS.map((field) => (
          <div key={field} className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[9rem_minmax(0,1fr)]">
            <label htmlFor={`${ids}-${field}`} className="text-sm font-medium text-stone-700">
              {IMPORT_FIELD_LABELS[field]}
            </label>
            <TagInput
              id={`${ids}-${field}`}
              values={ingestion.field_aliases[field]}
              onChange={(aliases) =>
                section.update({ field_aliases: { ...ingestion.field_aliases, [field]: aliases } })
              }
              placeholder="Header or label names"
            />
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          id={`${ids}-unit`}
          label="Unit when none is given"
          hint="Used when neither the value, the header nor a unit column names one."
        >
          <Select
            id={`${ids}-unit`}
            value={ingestion.default_yield_unit}
            options={units}
            onChange={(event) => section.update({ default_yield_unit: event.target.value })}
          />
        </FormField>
        <Toggle
          label="Read difficult reports with the LLM"
          description="Reports the rules can't parse go through the extraction loop (extract → validate → retry). Every extracted number must appear in the text."
          checked={ingestion.use_llm_extraction}
          onChange={(use_llm_extraction) => section.update({ use_llm_extraction })}
        />
      </div>
    </Card>
  );
};

const ReconciliationCard = () => {
  const ids = useId();
  const section = useSettingsSection('reconciliation');
  const reconciliation = section.draft;
  const priority = reconciliation.source_priority;

  const movePriority = (index: number, offset: number) => {
    const next = [...priority];
    const [item] = next.splice(index, 1);
    next.splice(index + offset, 0, item);
    section.update({ source_priority: next });
  };

  return (
    <Card
      title="Reconciliation"
      description="How values from different sources are merged into one trial and when they count as conflicting. Saving rebuilds every trial."
      footer={
        <SaveBar
          isDirty={section.isDirty}
          isSaving={section.isSaving}
          error={section.error}
          message={section.message}
          onSave={() => void section.save()}
          onDiscard={section.discard}
          onReset={() => void section.resetToDefaults()}
        />
      }
      bodyClassName="space-y-6"
    >
      <FormField
        id={`${ids}-tolerance`}
        label="Numbers agree within (%)"
        hint="7.8 t/ha and 7800 kg/ha always agree. With 5%, 42 and 44 t/ha would no longer count as a conflict."
        className="max-w-xs"
      >
        <TextInput
          id={`${ids}-tolerance`}
          type="number"
          min={0}
          max={50}
          step="0.1"
          value={String(reconciliation.numeric_tolerance_pct)}
          onChange={(event) => section.update({ numeric_tolerance_pct: Number(event.target.value) })}
        />
      </FormField>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-stone-800">While sources disagree</legend>
        <div className="space-y-2">
          {(Object.keys(CONFLICT_STRATEGY_LABELS) as ConflictStrategy[]).map((strategy) => (
            <label
              key={strategy}
              className="flex cursor-pointer items-start gap-2 rounded-lg border border-stone-200 p-3 has-[:checked]:border-emerald-400 has-[:checked]:bg-emerald-50/50"
            >
              <input
                type="radio"
                name={`${ids}-strategy`}
                checked={reconciliation.conflict_strategy === strategy}
                onChange={() => section.update({ conflict_strategy: strategy })}
                className="mt-1 accent-emerald-600"
              />
              <span>
                <span className="block text-sm font-medium text-stone-800">
                  {CONFLICT_STRATEGY_LABELS[strategy].label}
                </span>
                <span className="block text-xs text-stone-500">
                  {CONFLICT_STRATEGY_LABELS[strategy].description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <section>
        <h3 className="mb-1 text-sm font-semibold text-stone-800">Source priority</h3>
        <p className="mb-2 text-xs text-stone-500">
          Used by “highest-priority source”; ties go to the earlier import.
        </p>
        <ol className="max-w-sm divide-y divide-stone-100 rounded-lg border border-stone-200">
          {priority.map((kind, index) => (
            <li key={kind} className="flex items-center justify-between px-3 py-1.5 text-sm text-stone-800">
              <span>
                <span className="mr-2 text-stone-400 tabular-nums">{index + 1}.</span>
                {SOURCE_KIND_LABELS[kind]}
              </span>
              <span className="flex">
                <IconButton
                  icon={ArrowUp}
                  iconSize={14}
                  label={`Raise ${SOURCE_KIND_LABELS[kind]}`}
                  disabled={index === 0}
                  onClick={() => movePriority(index, -1)}
                />
                <IconButton
                  icon={ArrowDown}
                  iconSize={14}
                  label={`Lower ${SOURCE_KIND_LABELS[kind]}`}
                  disabled={index === priority.length - 1}
                  onClick={() => movePriority(index, 1)}
                />
              </span>
            </li>
          ))}
        </ol>
      </section>

      <CaveatRulesEditor
        rules={reconciliation.caveat_rules}
        onChange={(caveat_rules) => section.update({ caveat_rules })}
      />
    </Card>
  );
};

export const ImportRulesSection = () => (
  <>
    <IngestionCard />
    <ReconciliationCard />
  </>
);
