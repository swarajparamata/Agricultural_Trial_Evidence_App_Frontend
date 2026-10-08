/** First validation message per field, keyed by field name. */
export type FieldErrors<Values> = Partial<Record<keyof Values, string>>;

/** Raw values of the trial form – every input yields a string. Custom fields use `custom:<key>`. */
export type TrialFormValues = Record<string, string>;

interface TrialFormFieldBase {
  name: string;
  label: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  fullWidth?: boolean;
}

export type TrialFormField = TrialFormFieldBase &
  (
    | { control: 'text' }
    | { control: 'number'; step?: string }
    | { control: 'select'; options: readonly string[]; emptyLabel?: string }
    | { control: 'combo'; options: readonly string[] }
    | { control: 'textarea' }
    | { control: 'boolean' }
    | { control: 'date' }
  );
