import { atom } from 'jotai';
import { DEMO_TRIALS } from '@/constants';
import type { Trial, TrialFormValues } from '@/types';
import { api, errorMessage, getAppMode, naturalCompare } from '@/utils';
import type { LoadStatus } from '../settings';

/** All reconciled trial records – the source every derived trial atom reads from. */
export const trialsAtom = atom<readonly Trial[]>([]);

export const trialsStatusAtom = atom<{ status: LoadStatus; error: string | null }>({
  status: 'idle',
  error: null,
});

/** Loads the trials from the API (or the bundled sample trials in the offline demo). Earlier rows stay
 * visible while reloading, so the table never flashes empty. */
export const loadTrialsAtom = atom(null, async (get, set) => {
  if (getAppMode() !== 'api') {
    if (get(trialsStatusAtom).status === 'idle') set(trialsAtom, DEMO_TRIALS);
    set(trialsStatusAtom, { status: 'ready', error: null });
    return;
  }
  set(trialsStatusAtom, { status: 'loading', error: null });
  try {
    set(trialsAtom, await api.trials.list());
    set(trialsStatusAtom, { status: 'ready', error: null });
  } catch (error) {
    set(trialsStatusAtom, { status: 'error', error: errorMessage(error) });
  }
});

/** Adds a trial or replaces the one with the same ID. */
export const upsertTrialAtom = atom(null, (get, set, trial: Trial) => {
  const trials = get(trialsAtom);
  set(
    trialsAtom,
    trials.some((existing) => existing.id === trial.id)
      ? trials.map((existing) => (existing.id === trial.id ? trial : existing))
      : [...trials, trial].sort((a, b) => naturalCompare(a.id, b.id)),
  );
});

export const removeTrialAtom = atom(null, (get, set, id: string) => {
  set(
    trialsAtom,
    get(trialsAtom).filter((trial) => trial.id !== id),
  );
});

/** "Add trial" draft; it survives closing the modal and is cleared after a successful save. */
export const addTrialDraftAtom = atom<TrialFormValues | null>(null);
