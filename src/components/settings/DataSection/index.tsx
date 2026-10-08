import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { loadSettingsAtom, loadTrialsAtom } from '@/hooks';
import { DeletedTrialsCard } from '../DeletedTrialsCard';
import { ImportPanel } from '../ImportPanel';
import { MaintenanceCard } from '../MaintenanceCard';
import { SourceFilesCard } from '../SourceFilesCard';

/** Imports, source files, maintenance tasks and deleted trials. */
export const DataSection = () => {
  const loadTrials = useSetAtom(loadTrialsAtom);
  const loadSettings = useSetAtom(loadSettingsAtom);
  // Bumped after any data change so the file and deleted-trial lists fetch again.
  const [version, setVersion] = useState(0);

  const refresh = (settingsChanged = false) => {
    setVersion((current) => current + 1);
    void loadTrials();
    if (settingsChanged) void loadSettings();
  };

  return (
    <>
      <ImportPanel onImported={() => refresh()} />
      <SourceFilesCard key={`files-${version}`} onChanged={() => refresh()} />
      <MaintenanceCard onDone={refresh} />
      <DeletedTrialsCard key={`deleted-${version}`} />
    </>
  );
};
