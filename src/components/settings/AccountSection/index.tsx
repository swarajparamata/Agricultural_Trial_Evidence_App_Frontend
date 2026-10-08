import { useId, useState, type FormEvent } from 'react';
import { Badge, Button, Card, FormField, Notice, TextInput } from '@/components/ui';
import { MIN_PASSWORD_LENGTH } from '@/constants';
import { useAuthStore } from '@/hooks';
import { api, errorMessage, getAppMode, refreshApiUser } from '@/utils';

interface Status {
  busy: boolean;
  error: string | null;
  message: string | null;
}

const IDLE: Status = { busy: false, error: null, message: null };

export const AccountSection = () => {
  const user = useAuthStore((state) => state.user);
  const isApi = getAppMode() === 'api';
  const ids = useId();

  const [name, setName] = useState(user?.fullName ?? '');
  const [profile, setProfile] = useState<Status>(IDLE);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [password, setPassword] = useState<Status>(IDLE);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfile({ busy: true, error: null, message: null });
    try {
      await api.auth.updateProfile(name.trim());
      await refreshApiUser();
      setProfile({ busy: false, error: null, message: 'Saved.' });
    } catch (error) {
      setProfile({ busy: false, error: errorMessage(error), message: null });
    }
  };

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwords.next.length < MIN_PASSWORD_LENGTH) {
      setPassword({ busy: false, error: `Use at least ${MIN_PASSWORD_LENGTH} characters.`, message: null });
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPassword({ busy: false, error: 'The new passwords do not match.', message: null });
      return;
    }
    setPassword({ busy: true, error: null, message: null });
    try {
      await api.auth.changePassword(passwords.current, passwords.next);
      setPasswords({ current: '', next: '', confirm: '' });
      setPassword({ busy: false, error: null, message: 'Password changed.' });
    } catch (error) {
      setPassword({ busy: false, error: errorMessage(error), message: null });
    }
  };

  return (
    <>
      <Card title="My account" description="Your sign-in details and role.">
        <dl className="mb-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold text-stone-500 uppercase">Email</dt>
            <dd className="mt-0.5 font-medium text-stone-800">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-stone-500 uppercase">Role</dt>
            <dd className="mt-0.5">
              <Badge tone={user?.role === 'admin' ? 'emerald' : 'neutral'}>
                {user?.role === 'admin' ? 'Admin' : 'Viewer'}
              </Badge>
              <span className="ml-2 text-xs text-stone-500">
                {user?.role === 'admin'
                  ? 'Can manage users, trials, imports and settings.'
                  : 'Can browse, compare and ask the assistant.'}
              </span>
            </dd>
          </div>
        </dl>

        {isApi ? (
          <form onSubmit={(event) => void saveProfile(event)} className="flex flex-wrap items-end gap-3">
            <FormField id={`${ids}-name`} label="Display name" className="min-w-60 flex-1">
              <TextInput
                id={`${ids}-name`}
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={255}
              />
            </FormField>
            <Button type="submit" size="sm" disabled={profile.busy || name.trim() === (user?.fullName ?? '')}>
              {profile.busy ? 'Saving…' : 'Save name'}
            </Button>
            {profile.error && <p className="w-full text-sm text-red-600">{profile.error}</p>}
            {profile.message && <p className="w-full text-sm text-emerald-700">{profile.message}</p>}
          </form>
        ) : (
          <Notice>In the offline demo accounts aren't stored, so there is nothing to edit here.</Notice>
        )}
      </Card>

      {isApi && (
        <Card title="Change password">
          <form onSubmit={(event) => void changePassword(event)} className="grid max-w-xl grid-cols-1 gap-4">
            <FormField id={`${ids}-current`} label="Current password">
              <TextInput
                id={`${ids}-current`}
                type="password"
                autoComplete="current-password"
                value={passwords.current}
                onChange={(event) => setPasswords((current) => ({ ...current, current: event.target.value }))}
              />
            </FormField>
            <FormField
              id={`${ids}-next`}
              label="New password"
              hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
            >
              <TextInput
                id={`${ids}-next`}
                type="password"
                autoComplete="new-password"
                value={passwords.next}
                onChange={(event) => setPasswords((current) => ({ ...current, next: event.target.value }))}
              />
            </FormField>
            <FormField id={`${ids}-confirm`} label="Repeat the new password">
              <TextInput
                id={`${ids}-confirm`}
                type="password"
                autoComplete="new-password"
                value={passwords.confirm}
                onChange={(event) => setPasswords((current) => ({ ...current, confirm: event.target.value }))}
              />
            </FormField>
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                size="sm"
                disabled={password.busy || !passwords.current || !passwords.next}
              >
                {password.busy ? 'Changing…' : 'Change password'}
              </Button>
              {password.error && <p className="text-sm text-red-600">{password.error}</p>}
              {password.message && <p className="text-sm text-emerald-700">{password.message}</p>}
            </div>
          </form>
        </Card>
      )}
    </>
  );
};
