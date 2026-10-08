import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { loadSettingsAtom, loadTrialsAtom } from '../atoms';

/** Loads the settings and the trials once the user is signed in. */
export const useAppDataLoader = () => {
  const loadSettings = useSetAtom(loadSettingsAtom);
  const loadTrials = useSetAtom(loadTrialsAtom);

  useEffect(() => {
    void loadSettings();
    void loadTrials();
  }, [loadSettings, loadTrials]);
};
