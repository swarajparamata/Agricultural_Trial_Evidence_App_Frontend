import { useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import type { AppSettings, SettingsSectionName } from '@/types';
import { api, errorMessage, plural } from '@/utils';
import { applySettingsAtom, loadTrialsAtom, settingsAtom } from '../atoms';

interface SaveState {
  isSaving: boolean;
  error: string | null;
  message: string | null;
}

/**
 * An editable copy of one settings section. `save` stores it on the backend; sections that change
 * how data is read (reference data, custom fields, import rules) also rebuild the trials, which are
 * then reloaded here.
 */
export const useSettingsSection = <Section extends SettingsSectionName>(section: Section) => {
  const saved = useAtomValue(settingsAtom)[section];
  const applySettings = useSetAtom(applySettingsAtom);
  const reloadTrials = useSetAtom(loadTrialsAtom);
  const [draft, setDraft] = useState<AppSettings[Section]>(saved);
  const [state, setState] = useState<SaveState>({ isSaving: false, error: null, message: null });

  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const update = (patch: Partial<AppSettings[Section]>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setState((current) => ({ ...current, message: null }));
  };

  const run = async (request: () => ReturnType<typeof api.settings.reset>, done: string) => {
    setState({ isSaving: true, error: null, message: null });
    try {
      const response = await request();
      applySettings(response.settings);
      setDraft(response.settings[section]);
      if (response.rebuild) await reloadTrials();
      const rebuilt = response.rebuild
        ? ` Rebuilt ${plural(response.rebuild.trials, 'trial')} from ${plural(response.rebuild.files, 'file')}.`
        : '';
      setState({ isSaving: false, error: null, message: `${done}${rebuilt}` });
    } catch (error) {
      setState({ isSaving: false, error: errorMessage(error), message: null });
    }
  };

  const save = () => run(() => api.settings.update(section, draft), 'Saved.');
  const resetToDefaults = () => run(() => api.settings.reset(section), 'Restored the defaults.');
  const discard = () => {
    setDraft(saved);
    setState({ isSaving: false, error: null, message: null });
  };

  return { draft, setDraft, update, isDirty, save, resetToDefaults, discard, ...state };
};
