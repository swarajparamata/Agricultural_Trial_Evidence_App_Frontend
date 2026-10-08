import { atom } from 'jotai';
import { settingsAtom } from '../settings';
import { trialsAtom } from '../trials';

/** Selected trial IDs in the order they were picked (that is the comparison order). */
export const selectedTrialIdsAtom = atom<readonly string[]>([]);

/** Selected trials that still exist, including ones currently hidden by the filters. */
export const selectedTrialsAtom = atom((get) => {
  const trialsById = new Map(get(trialsAtom).map((trial) => [trial.id, trial]));
  return get(selectedTrialIdsAtom).flatMap((id) => trialsById.get(id) ?? []);
});

export const maxSelectionAtom = atom((get) => get(settingsAtom).comparison.max_trials);

/** Selects or deselects a trial; at the comparison limit further trials can't be added. */
export const toggleTrialSelectionAtom = atom(null, (get, set, id: string) => {
  const selectedIds = get(selectedTrialIdsAtom);
  if (selectedIds.includes(id)) {
    set(
      selectedTrialIdsAtom,
      selectedIds.filter((selectedId) => selectedId !== id),
    );
  } else if (get(selectedTrialsAtom).length < get(maxSelectionAtom)) {
    set(selectedTrialIdsAtom, [...selectedIds, id]);
  }
});

export const clearSelectionAtom = atom(null, (_get, set) => {
  set(selectedTrialIdsAtom, []);
});
