import { KeyRound } from 'lucide-react';
import { useId } from 'react';
import { Badge, Button, FormField, TextInput } from '@/components/ui';
import { AUTH_MODE_COPY } from '@/constants';
import { useLoginForm } from '@/hooks';
import type { DemoAccount } from '@/types';
import { getFieldA11yProps } from '@/utils';

interface LoginFormProps {
  /** Seeded demo accounts (backend demo mode); clicking one fills the form. */
  demoAccounts: readonly DemoAccount[];
  allowSignUp: boolean;
}

export const LoginForm = ({ demoAccounts, allowSignUp }: LoginFormProps) => {
  const {
    mode,
    values,
    fieldErrors,
    authError,
    isSubmitting,
    setField,
    fillCredentials,
    toggleMode,
    handleSubmit,
  } = useLoginForm();
  const emailId = useId();
  const passwordId = useId();
  const copy = AUTH_MODE_COPY[mode];

  return (
    <>
      <h2 className="mb-6 text-center text-lg font-semibold text-stone-600">{copy.title}</h2>

      {demoAccounts.length > 0 && mode === 'signIn' && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
            <KeyRound size={14} aria-hidden="true" /> Demo accounts – click to fill in
          </p>
          <ul className="space-y-1.5">
            {demoAccounts.map((account) => (
              <li key={account.email}>
                <button
                  type="button"
                  onClick={() => fillCredentials({ email: account.email, password: account.password })}
                  className="flex w-full items-center justify-between gap-2 rounded-md bg-white px-3 py-2 text-left text-xs shadow-xs ring-1 ring-emerald-100 transition-colors hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-500"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-stone-800">{account.email}</span>
                    <span className="font-mono text-stone-500">{account.password}</span>
                  </span>
                  <Badge tone={account.role === 'admin' ? 'emerald' : 'neutral'}>{account.role}</Badge>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {authError && (
        <div role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {authError}
        </div>
      )}

      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <FormField id={emailId} label="Email" error={fieldErrors.email}>
          <TextInput
            id={emailId}
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => setField('email', event.target.value)}
            {...getFieldA11yProps(emailId, fieldErrors.email)}
          />
        </FormField>
        <FormField id={passwordId} label="Password" error={fieldErrors.password}>
          <TextInput
            id={passwordId}
            type="password"
            autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
            value={values.password}
            onChange={(event) => setField('password', event.target.value)}
            {...getFieldA11yProps(passwordId, fieldErrors.password)}
          />
        </FormField>
        <Button type="submit" disabled={isSubmitting} className="w-full text-base">
          {isSubmitting ? copy.pending : copy.submit}
        </Button>
      </form>

      {(allowSignUp || mode === 'signUp') && (
        <div className="mt-6 text-center text-sm text-stone-500">
          {copy.switchPrompt}
          <Button variant="link" size="none" onClick={toggleMode} className="ml-1">
            {copy.switchAction}
          </Button>
        </div>
      )}
      {!allowSignUp && mode === 'signIn' && (
        <p className="mt-6 text-center text-xs text-stone-500">Accounts are created by an administrator.</p>
      )}
    </>
  );
};
