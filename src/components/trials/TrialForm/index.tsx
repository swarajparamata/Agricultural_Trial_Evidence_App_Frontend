import { useId } from 'react';
import { Button, FormField, Notice } from '@/components/ui';
import { useTrialForm } from '@/hooks';
import type { Trial } from '@/types';
import type { TrialFormMode } from '@/utils';
import { TrialFormControl } from '../TrialFormControl';

interface TrialFormProps {
  mode: TrialFormMode;
  /** The trial being edited (null when adding). */
  trial: Trial | null;
  onCancel: () => void;
  onSaved: (trial: Trial) => void;
}

export const TrialForm = ({ mode, trial, onCancel, onSaved }: TrialFormProps) => {
  const { fields, values, errors, formError, isSubmitting, setField, handleSubmit } = useTrialForm(
    mode,
    trial,
    onSaved,
  );
  const idPrefix = useId();

  return (
    <form noValidate onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      {formError && <Notice tone="error">{formError}</Notice>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const id = `${idPrefix}-${field.name}`;
          return (
            <FormField
              key={field.name}
              id={id}
              label={field.required ? `${field.label} *` : field.label}
              hint={field.hint}
              error={errors[field.name] || undefined}
              className={field.fullWidth ? 'sm:col-span-2' : undefined}
            >
              <TrialFormControl
                id={id}
                field={field}
                value={values[field.name] ?? ''}
                error={errors[field.name] || undefined}
                onChange={(value) => setField(field.name, value)}
              />
            </FormField>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-end gap-3 border-t border-stone-100 pt-4">
        <p className="mr-auto text-xs text-stone-500">* required</p>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Save Trial' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};
