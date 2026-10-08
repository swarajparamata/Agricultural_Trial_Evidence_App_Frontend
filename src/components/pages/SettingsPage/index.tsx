import { useAtomValue } from 'jotai';
import type { ReactNode } from 'react';
import {
  AccountSection,
  ActivitySection,
  AssistantSection,
  CustomFieldsSection,
  DataSection,
  DisplaySection,
  ImportRulesSection,
  ReferenceDataSection,
  UsersSection,
} from '@/components/settings';
import { Notice, Spinner } from '@/components/ui';
import { SETTINGS_TABS } from '@/constants';
import { settingsStatusAtom, useIsAdmin, useRoute } from '@/hooks';
import type { SettingsTab } from '@/types';
import { cn, getAppMode } from '@/utils';

const renderSection = (tab: SettingsTab): ReactNode => {
  switch (tab) {
    case 'account':
      return <AccountSection />;
    case 'users':
      return <UsersSection />;
    case 'data':
      return <DataSection />;
    case 'fields':
      return <CustomFieldsSection />;
    case 'reference':
      return <ReferenceDataSection />;
    case 'display':
      return <DisplaySection />;
    case 'import-rules':
      return <ImportRulesSection />;
    case 'assistant':
      return <AssistantSection />;
    case 'activity':
      return <ActivitySection />;
  }
};

interface SettingsPageProps {
  tab: SettingsTab;
}

/** Admins configure users, data, fields, vocabularies, display and the assistant; viewers manage their account. */
export const SettingsPage = ({ tab }: SettingsPageProps) => {
  const isAdmin = useIsAdmin();
  const { navigate } = useRoute();
  const { status, error } = useAtomValue(settingsStatusAtom);
  const tabs = SETTINGS_TABS.filter((config) => isAdmin || !config.adminOnly);
  const current = tabs.find((config) => config.id === tab) ?? tabs[0];
  const needsBackend = getAppMode() !== 'api' && current.id !== 'account';

  let content: ReactNode;
  if (needsBackend) {
    content = (
      <Notice tone="info" title="This page needs the backend">
        In the offline demo nothing is stored on a server. Start the AgriEvidence API (and the LLM service),
        set VITE_API_BASE_URL and sign in with a demo account to manage users, imports, custom fields and the
        assistant.
      </Notice>
    );
  } else if (status === 'error') {
    content = (
      <Notice tone="error" title="The settings could not be loaded">
        {error}
      </Notice>
    );
  } else if (status !== 'ready' && current.id !== 'account') {
    content = <Spinner label="Loading settings…" />;
  } else {
    content = renderSection(current.id);
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:flex-row">
      <nav aria-label="Settings" className="shrink-0 lg:w-56">
        <h2 className="mb-3 hidden text-xs font-semibold tracking-wide text-stone-500 uppercase lg:block">
          {isAdmin ? 'Settings' : 'Account'}
        </h2>
        <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = id === current.id;
            return (
              <li key={id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => navigate({ page: 'settings', tab: id })}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500',
                    active
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
                  )}
                >
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="min-w-0 flex-1 space-y-6">{content}</div>
    </main>
  );
};
