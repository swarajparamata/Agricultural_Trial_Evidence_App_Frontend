import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, Notice, Select, Spinner, TextInput, Toggle } from '@/components/ui';
import { MIN_PASSWORD_LENGTH } from '@/constants';
import { useAsyncResource, useAuthStore, useSettingsSection } from '@/hooks';
import type { Role, UserAccount } from '@/types';
import { api, errorMessage, fmtDateTime } from '@/utils';
import { AddUserForm } from '../AddUserForm';
import { SaveBar } from '../SaveBar';

type RowAction = { kind: 'password'; value: string } | { kind: 'delete' };

const AccessCard = () => {
  const access = useSettingsSection('access');
  return (
    <Card
      title="Access"
      description="Who can create accounts."
      footer={
        <SaveBar
          isDirty={access.isDirty}
          isSaving={access.isSaving}
          error={access.error}
          message={access.message}
          onSave={() => void access.save()}
          onDiscard={access.discard}
        />
      }
    >
      <Toggle
        label="Allow self sign-up"
        description="Anyone who can reach the login page can create a viewer account. Admins are always added here by another admin."
        checked={access.draft.allow_self_signup}
        onChange={(allow_self_signup) => access.update({ allow_self_signup })}
      />
    </Card>
  );
};

export const UsersSection = () => {
  const { data: users, error, isLoading, reload } = useAsyncResource(api.users.list);
  const me = useAuthStore((state) => state.user);
  const [showAdd, setShowAdd] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [actions, setActions] = useState<Record<number, RowAction>>({});

  const setAction = (id: number, action: RowAction | null) =>
    setActions((current) => {
      const next = { ...current };
      if (action) next[id] = action;
      else delete next[id];
      return next;
    });

  const run = async (user: UserAccount, request: () => Promise<unknown>) => {
    setBusyId(user.id);
    setRowError(null);
    try {
      await request();
      setAction(user.id, null);
      reload();
    } catch (requestError) {
      setRowError(`${user.email}: ${errorMessage(requestError)}`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <Card
        title="Users"
        description="Admins manage users, trials, imports and settings. Viewers browse, compare and ask the assistant."
        actions={
          !showAdd && (
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <UserPlus size={16} aria-hidden="true" /> Add user
            </Button>
          )
        }
      >
        {showAdd && (
          <AddUserForm
            onCancel={() => setShowAdd(false)}
            onCreated={() => {
              setShowAdd(false);
              reload();
            }}
          />
        )}
        {rowError && (
          <Notice tone="error" className="mb-3">
            {rowError}
          </Notice>
        )}
        {error && <Notice tone="error">{error}</Notice>}
        {isLoading && !users && <Spinner label="Loading users…" />}
        {users && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 text-xs text-stone-500 uppercase">
                <tr>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    User
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Role
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Active
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Last sign-in
                  </th>
                  <th scope="col" className="py-2 pl-3 text-right font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isMe = me?.email === user.email;
                  const action = actions[user.id];
                  const busy = busyId === user.id;
                  return (
                    <tr key={user.id} className="border-b border-stone-100 align-top last:border-0">
                      <td className="py-3 pr-3">
                        <p className="font-medium text-stone-800">
                          {user.full_name || user.email}
                          {isMe && (
                            <Badge className="ml-2" tone="sky">
                              you
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-stone-500">{user.email}</p>
                      </td>
                      <td className="px-3 py-3">
                        <Select
                          aria-label={`Role of ${user.email}`}
                          value={user.role}
                          disabled={isMe || busy}
                          options={[
                            { value: 'viewer', label: 'Viewer' },
                            { value: 'admin', label: 'Admin' },
                          ]}
                          onChange={(event) =>
                            void run(user, () =>
                              api.users.update(user.id, { role: event.target.value as Role }),
                            )
                          }
                          className="w-28 py-1.5"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <Toggle
                          hideLabel
                          label={`${user.email} can sign in`}
                          checked={user.is_active}
                          disabled={isMe || busy}
                          onChange={(is_active) =>
                            void run(user, () => api.users.update(user.id, { is_active }))
                          }
                        />
                      </td>
                      <td className="px-3 py-3 text-xs whitespace-nowrap text-stone-500">
                        {user.last_login_at ? fmtDateTime(user.last_login_at) : 'never'}
                      </td>
                      <td className="py-3 pl-3 text-right">
                        {action?.kind === 'password' ? (
                          <div className="flex items-center justify-end gap-2">
                            <TextInput
                              type="password"
                              aria-label={`New password for ${user.email}`}
                              placeholder="New password"
                              autoComplete="new-password"
                              value={action.value}
                              onChange={(event) =>
                                setAction(user.id, { kind: 'password', value: event.target.value })
                              }
                              className="w-40 py-1.5"
                            />
                            <Button size="xs" variant="ghost" onClick={() => setAction(user.id, null)}>
                              Cancel
                            </Button>
                            <Button
                              size="xs"
                              disabled={busy || action.value.length < MIN_PASSWORD_LENGTH}
                              onClick={() =>
                                void run(user, () => api.users.update(user.id, { password: action.value }))
                              }
                            >
                              Set
                            </Button>
                          </div>
                        ) : action?.kind === 'delete' ? (
                          <div className="flex items-center justify-end gap-2 text-xs text-stone-600">
                            Delete this user?
                            <Button size="xs" variant="ghost" onClick={() => setAction(user.id, null)}>
                              No
                            </Button>
                            <Button
                              size="xs"
                              variant="danger"
                              disabled={busy}
                              onClick={() => void run(user, () => api.users.remove(user.id))}
                            >
                              Delete
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => setAction(user.id, { kind: 'password', value: '' })}
                            >
                              Reset password
                            </Button>
                            {!isMe && (
                              <Button
                                size="xs"
                                variant="ghost"
                                className="text-red-600"
                                onClick={() => setAction(user.id, { kind: 'delete' })}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <AccessCard />
    </>
  );
};
