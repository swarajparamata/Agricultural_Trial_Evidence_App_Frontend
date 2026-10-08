import { Select, TextArea, TextInput } from '@/components/ui';
import type { TrialFormField } from '@/types';
import { getFieldA11yProps } from '@/utils';

interface TrialFormControlProps {
  id: string;
  field: TrialFormField;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

/** Renders the input that matches the field's `control` type. */
export const TrialFormControl = ({ id, field, value, error, onChange }: TrialFormControlProps) => {
  const sharedProps = { id, value, ...getFieldA11yProps(id, error) };

  switch (field.control) {
    case 'select':
      return (
        <Select
          {...sharedProps}
          options={field.options}
          placeholder={field.emptyLabel}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case 'boolean':
      return (
        <Select
          {...sharedProps}
          options={['Yes', 'No']}
          placeholder={field.required ? undefined : '—'}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case 'combo':
      // Free text with suggestions: known values are offered, new ones are allowed.
      return (
        <>
          <TextInput
            {...sharedProps}
            type="text"
            list={`${id}-options`}
            placeholder={field.placeholder}
            autoComplete="off"
            onChange={(event) => onChange(event.target.value)}
          />
          <datalist id={`${id}-options`}>
            {field.options.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </>
      );
    case 'textarea':
      return (
        <TextArea
          {...sharedProps}
          rows={3}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case 'number':
      return (
        <TextInput
          {...sharedProps}
          type="number"
          inputMode="decimal"
          step={field.step}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case 'date':
      return <TextInput {...sharedProps} type="date" onChange={(event) => onChange(event.target.value)} />;
    case 'text':
      return (
        <TextInput
          {...sharedProps}
          type="text"
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      );
  }
};
