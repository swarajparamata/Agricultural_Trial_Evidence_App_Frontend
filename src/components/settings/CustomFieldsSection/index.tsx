import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, IconButton } from '@/components/ui';
import { CUSTOM_FIELD_TYPE_LABELS, EMPTY_CUSTOM_FIELD } from '@/constants';
import { useSettingsSection } from '@/hooks';
import type { CustomFieldDefinition } from '@/types';
import { CustomFieldEditor } from '../CustomFieldEditor';
import { SaveBar } from '../SaveBar';

type Editing = { index: number | null; field: CustomFieldDefinition } | null;

const move = <T,>(items: readonly T[], from: number, to: number): T[] => {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

/** Admin-defined trial fields: they appear in the trial form, table, filters and comparisons. */
export const CustomFieldsSection = () => {
  const section = useSettingsSection('custom_fields');
  const fields = section.draft.fields;
  const [editing, setEditing] = useState<Editing>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const setFields = (next: CustomFieldDefinition[]) => section.update({ fields: next });

  return (
    <Card
      title="Custom fields"
      description="Extra information recorded for every trial, such as soil type or application rate. Values come from the trial form or from matching CSV columns; saving re-reads the imported files."
      actions={
        !editing && (
          <Button size="sm" onClick={() => setEditing({ index: null, field: EMPTY_CUSTOM_FIELD })}>
            <Plus size={16} aria-hidden="true" /> Add field
          </Button>
        )
      }
      footer={
        <SaveBar
          isDirty={section.isDirty}
          isSaving={section.isSaving}
          error={section.error}
          message={section.message}
          onSave={() => void section.save()}
          onDiscard={() => {
            setEditing(null);
            section.discard();
          }}
          onReset={() => void section.resetToDefaults()}
        />
      }
    >
      {editing && (
        <CustomFieldEditor
          key={editing.index ?? 'new'}
          initial={editing.field}
          isNew={editing.index === null}
          takenKeys={fields.map((field) => field.key)}
          onCancel={() => setEditing(null)}
          onApply={(field) => {
            setFields(
              editing.index === null
                ? [...fields, field]
                : fields.map((item, i) => (i === editing.index ? field : item)),
            );
            setEditing(null);
          }}
        />
      )}

      {fields.length === 0 ? (
        <p className="text-sm text-stone-500">No custom fields yet.</p>
      ) : (
        <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200">
          {fields.map((field, index) => (
            <li key={field.key} className="flex flex-wrap items-start justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-stone-800">
                  {field.label}
                  {field.unit && <span className="font-normal text-stone-500"> ({field.unit})</span>}
                  <code className="ml-2 rounded-sm bg-stone-100 px-1 font-mono text-xs font-normal text-stone-500">
                    {field.key}
                  </code>
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <Badge tone="sky">{CUSTOM_FIELD_TYPE_LABELS[field.type]}</Badge>
                  {field.required && <Badge tone="amber">required</Badge>}
                  {field.show_in_table && <Badge>table</Badge>}
                  {field.show_in_filters && <Badge>filter</Badge>}
                  {field.show_in_compare && <Badge>compare</Badge>}
                  {field.chartable && <Badge tone="emerald">chart</Badge>}
                </div>
                {field.options.length > 0 && (
                  <p className="mt-1 text-xs text-stone-500">Options: {field.options.join(', ')}</p>
                )}
                {field.description && <p className="mt-1 text-xs text-stone-500">{field.description}</p>}
              </div>
              {confirmRemove === field.key ? (
                <span className="flex items-center gap-2 text-xs text-stone-600">
                  Remove “{field.label}”? Its values disappear from the trials.
                  <Button size="xs" variant="ghost" onClick={() => setConfirmRemove(null)}>
                    No
                  </Button>
                  <Button
                    size="xs"
                    variant="danger"
                    onClick={() => {
                      setFields(fields.filter((item) => item.key !== field.key));
                      setConfirmRemove(null);
                    }}
                  >
                    Remove
                  </Button>
                </span>
              ) : (
                <div className="flex items-center gap-1">
                  <IconButton
                    icon={ArrowUp}
                    iconSize={16}
                    label={`Move ${field.label} up`}
                    disabled={index === 0}
                    onClick={() => setFields(move(fields, index, index - 1))}
                  />
                  <IconButton
                    icon={ArrowDown}
                    iconSize={16}
                    label={`Move ${field.label} down`}
                    disabled={index === fields.length - 1}
                    onClick={() => setFields(move(fields, index, index + 1))}
                  />
                  <IconButton
                    icon={Pencil}
                    iconSize={16}
                    label={`Edit ${field.label}`}
                    onClick={() => setEditing({ index, field })}
                  />
                  <IconButton
                    icon={Trash2}
                    iconSize={16}
                    label={`Remove ${field.label}`}
                    onClick={() => setConfirmRemove(field.key)}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
