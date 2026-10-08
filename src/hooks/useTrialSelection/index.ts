import { useAtomValue, useSetAtom } from 'jotai';
import { clearSelectionAtom, maxSelectionAtom, selectedTrialsAtom, toggleTrialSelectionAtom } from '../atoms';

export const useTrialSelection = () => {
  const selectedTrials = useAtomValue(selectedTrialsAtom);
  const maxSelection = useAtomValue(maxSelectionAtom);
  const toggleSelection = useSetAtom(toggleTrialSelectionAtom);
  const clearSelection = useSetAtom(clearSelectionAtom);
  const selectedIds = selectedTrials.map((trial) => trial.id);

  return {
    selectedIds,
    selectedCount: selectedIds.length,
    maxSelection,
    isFull: selectedIds.length >= maxSelection,
    toggleSelection,
    clearSelection,
  };
};
