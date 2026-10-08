import { useId, useState, type FormEvent } from 'react';
import { Button, FormField, Select, TextInput } from '@/components/ui';
import { MIN_PASSWORD_LENGTH } from '@/constants';
import type { Role } from '@/types';
import { api, apiFieldErrors, errorMessage } from '@/utils';

interface AddUserFormProps {
  onCreated: () => void;
  onCancel: () => void;
}

const ROLE_OPTIONS = [
  { value: 'viewer', label: 'Viewer – browse, compare, ask the assistant' },
  { value: 'admin', label: 'Admin – also manage users, trials and settings' },
];

export const AddUserForm = ({ onCreated, onCancel }: AddUserFormProps) => {
  const ids = useId();
  const [values, setValues] = useState({ email: '', full_name: '', password: '', role: 'viewer' as Role });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const problems: Record<string, string> = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email.trim()))
      problems.email = 'Enter a valid email address';
    if (values.password.length < MIN_PASSWORD_LENGTH)
      problems.password = `At least ${MIN_PASSWORD_LENGTH} characters`;
    if (Object.keys(problems).length) {
      setErrors(problems);
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      await api.users.create({ ...values, email: values.email.trim(), full_name: values.full_name.trim() });
      onCreated();
    } catch (error) {
      setErrors(apiFieldErrors(error));
      setFormError(errorMessage(error));
      setBusy(false);
    }
  };

  return (
    <form
      noValidate
      onSubmit={(event) => void submit(event)}
      className="mb-5 grid grid-cols-1 gap-4 rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 sm:grid-cols-2"
    >
      <FormField id={`${ids}-email`} label="Email *" error={errors.email || undefined}>
        <TextInput
          id={`${ids}-email`}
          type="email"
          value={values.email}
          onChange={(event) => set('email', event.target.value)}
        />
      </FormField>
      <FormField id={`${ids}-name`} label="Full name">
        <TextInput
          id={`${ids}-name`}
          value={values.full_name}
          onChange={(event) => set('full_name', event.target.value)}
        />
      </FormField>
      <FormField
        id={`${ids}-password`}
        label="Initial password *"
        error={errors.password || undefined}
        hint="Share it securely; they can change it under My account."
      >
        <TextInput
          id={`${ids}-password`}
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(event) => set('password', event.target.value)}
        />
      </FormField>
      <FormField id={`${ids}-role`} label="Role">
        <Select
          id={`${ids}-role`}
          value={values.role}
          options={ROLE_OPTIONS}
          onChange={(event) => set('role', event.target.value)}
        />
      </FormField>
      <div className="flex items-center justify-end gap-3 sm:col-span-2">
        {formError && <p className="mr-auto text-sm text-red-600">{formError}</p>}
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? 'Adding…' : 'Add user'}
        </Button>
      </div>
    </form>
  );
};
