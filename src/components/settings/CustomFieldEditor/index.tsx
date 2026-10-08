import { useId, useState } from 'react';
import { Button, FormField, Select, TagInput, TextInput, Toggle } from '@/components/ui';
import { CUSTOM_FIELD_TYPE_LABELS } from '@/constants';
import type { CustomFieldDefinition, CustomFieldType } from '@/types';

const RESERVED = new Set([
  'trial_id', 'crop', 'product', 'country', 'year', 'trial_type', 'treatment_yield', 'control_yield', 'yield_unit',
  'notes', 'id', 'status', 'sources', 'caveats', 'uplift_pct', 'yield_difference',
]); // prettier-ignore

/** "Soil type" -> "soil_type". */
const toKey = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/^(\d)/, 'f_$1')
    .slice(0, 40);

interface CustomFieldEditorProps {
  initial: CustomFieldDefinition;
  isNew: boolean;
  takenKeys: readonly string[];
  onCancel: () => void;
  onApply: (field: CustomFieldDefinition) => void;
}

export const CustomFieldEditor = ({
  initial,
  isNew,
  takenKeys,
  onCancel,
  onApply,
}: CustomFieldEditorProps) => {
  const ids = useId();
  const [field, setField] = useState<CustomFieldDefinition>(initial);
  const [keyTouched, setKeyTouched] = useState(!isNew);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (patch: Partial<CustomFieldDefinition>) => setField((current) => ({ ...current, ...patch }));

  const apply = () => {
    const problems: Record<string, string> = {};
    if (!field.label.trim()) problems.label = 'A label is required';
    if (!/^[a-z][a-z0-9_]{0,39}$/.test(field.key))
      problems.key = 'Lowercase letters, digits and _; start with a letter';
    else if (RESERVED.has(field.key)) problems.key = 'This name is used by a built-in field';
    else if (isNew && takenKeys.includes(field.key)) problems.key = 'Another field already uses this key';
    if (field.type === 'select' && field.options.length === 0) problems.options = 'Add at least one option';
    setErrors(problems);
    if (Object.keys(problems).length) return;
    onApply({
      ...field,
      label: field.label.trim(),
      options: field.type === 'select' ? field.options : [],
      unit: field.type === 'number' ? field.unit?.trim() || null : null,
      chartable: field.type === 'number' && field.chartable,
    });
  };

  return (
    <div className="mb-5 space-y-4 rounded-lg border border-emerald-200 bg-emerald-50/40 p-4">
      <p className="text-sm font-semibold text-stone-800">
        {isNew ? 'New custom field' : `Edit “${initial.label}”`}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id={`${ids}-label`} label="Label *" error={errors.label}>
          <TextInput
            id={`${ids}-label`}
            value={field.label}
            placeholder="e.g. Soil type"
            onChange={(event) =>
              update({ label: event.target.value, ...(keyTouched ? {} : { key: toKey(event.target.value) }) })
            }
          />
        </FormField>
        <FormField
          id={`${ids}-key`}
          label="Key *"
          error={errors.key}
          hint={isNew ? 'Stable identifier used by the API and imports.' : 'Keys cannot change once saved.'}
        >
          <TextInput
            id={`${ids}-key`}
            value={field.key}
            disabled={!isNew}
            className="font-mono"
            onChange={(event) => {
              setKeyTouched(true);
              update({ key: event.target.value });
            }}
          />
        </FormField>
        <FormField id={`${ids}-type`} label="Type">
          <Select
            id={`${ids}-type`}
            value={field.type}
            options={Object.entries(CUSTOM_FIELD_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
            onChange={(event) => update({ type: event.target.value as CustomFieldType })}
          />
        </FormField>
        {field.type === 'number' && (
          <FormField id={`${ids}-unit`} label="Unit" hint="Shown next to values, e.g. L/ha or ha.">
            <TextInput
              id={`${ids}-unit`}
              value={field.unit ?? ''}
              onChange={(event) => update({ unit: event.target.value })}
            />
          </FormField>
        )}
        {field.type === 'select' && (
          <FormField id={`${ids}-options`} label="Options *" error={errors.options} className="sm:col-span-2">
            <TagInput
              id={`${ids}-options`}
              values={field.options}
              onChange={(options) => update({ options })}
              placeholder="Type an option and press Enter"
            />
          </FormField>
        )}
        <FormField id={`${ids}-description`} label="Description" className="sm:col-span-2">
          <TextInput
            id={`${ids}-description`}
            value={field.description}
            placeholder="Shown as help text in the trial form"
            onChange={(event) => update({ description: event.target.value })}
          />
        </FormField>
        <FormField
          id={`${ids}-aliases`}
          label="Read from these CSV columns / report labels"
          hint={`Besides “${field.label || 'the label'}” and “${field.key || 'the key'}”, matched ignoring case and spaces.`}
          className="sm:col-span-2"
        >
          <TagInput
            id={`${ids}-aliases`}
            values={field.source_aliases}
            onChange={(source_aliases) => update({ source_aliases })}
            placeholder="e.g. Dose L/ha"
          />
        </FormField>
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
        <Toggle
          label="Required when adding a trial"
          checked={field.required}
          onChange={(required) => update({ required })}
        />
        <Toggle
          label="Show as a table column"
          checked={field.show_in_table}
          onChange={(show_in_table) => update({ show_in_table })}
        />
        <Toggle
          label="Offer as a filter"
          checked={field.show_in_filters}
          onChange={(show_in_filters) => update({ show_in_filters })}
        />
        <Toggle
          label="Show in comparisons"
          checked={field.show_in_compare}
          onChange={(show_in_compare) => update({ show_in_compare })}
        />
        {field.type === 'number' && (
          <Toggle
            label="Chart it in comparisons"
            description="Adds a bar chart of this value to the compare view."
            checked={field.chartable}
            onChange={(chartable) => update({ chartable })}
          />
        )}
      </div>
      <div className="flex justify-end gap-3">
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={apply}>
          {isNew ? 'Add field' : 'Apply'}
        </Button>
      </div>
    </div>
  );
};
