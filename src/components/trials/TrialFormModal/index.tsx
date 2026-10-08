import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useId, useState } from 'react';
import { Modal, Notice } from '@/components/ui';
import { ADD_TRIAL_METHODS } from '@/constants';
import { loadTrialsAtom, trialFormAtom, trialsAtom } from '@/hooks';
import type { AddTrialMethod } from '@/types';
import { cn, getAppMode } from '@/utils';
import { TrialFileImport } from '../TrialFileImport';
import { TrialForm } from '../TrialForm';

const SUBTITLES: Record<AddTrialMethod, string> = {
  manual: 'Yields can be entered in any configured unit; they are converted for display.',
  files:
    'Spreadsheets (.csv, .tsv) in any column layout and text reports (.txt, .md). Each trial they contain is reconciled with the data already there; re-importing a file with the same name replaces it.',
};

/** Add a trial by hand or from files, or edit one (admins only). */
export const TrialFormModal = () => {
  const [state, setState] = useAtom(trialFormAtom);
  const trials = useAtomValue(trialsAtom);
  const loadTrials = useSetAtom(loadTrialsAtom);
  const [method, setMethod] = useState<AddTrialMethod>('manual');
  const ids = useId();
  const close = () => {
    setState(null);
    setMethod('manual');
  };

  const isCreate = state?.mode === 'create';
  const trial = state?.mode === 'edit' ? (trials.find((item) => item.id === state.trialId) ?? null) : null;
  const imported = trial?.origin === 'ingested';

  return (
    <Modal
      isOpen={state !== null}
      onClose={close}
      title={state?.mode === 'edit' ? `Edit trial ${state.trialId}` : 'Add New Trial'}
      subtitle={
        state?.mode === 'edit'
          ? imported
            ? 'Changes are kept as admin overrides on top of the source files, which stay untouched. Clear a field to go back to the source value.'
            : 'This trial was entered manually, so its entry is updated directly.'
          : SUBTITLES[method]
      }
    >
      {isCreate && (
        <div
          role="tablist"
          aria-label="How to add trials"
          className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-stone-100 p-1 text-sm font-medium"
        >
          {ADD_TRIAL_METHODS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`${ids}-${id}-tab`}
              aria-selected={method === id}
              aria-controls={`${ids}-panel`}
              onClick={() => setMethod(id)}
              className={cn(
                'flex items-center justify-center gap-2 rounded-md px-3 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500',
                method === id ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-600 hover:text-stone-900',
              )}
            >
              <Icon size={15} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      )}
      {state && (
        <div
          id={`${ids}-panel`}
          role={isCreate ? 'tabpanel' : undefined}
          aria-labelledby={isCreate ? `${ids}-${method}-tab` : undefined}
        >
          {isCreate && method === 'files' ? (
            getAppMode() === 'api' ? (
              <TrialFileImport onImported={() => void loadTrials()} onClose={close} />
            ) : (
              <Notice tone="info">
                Importing files needs the backend. In the offline demo, enter the trial by hand.
              </Notice>
            )
          ) : (
            <TrialForm
              key={state.mode === 'edit' ? state.trialId : 'create'}
              mode={state.mode}
              trial={trial}
              onCancel={close}
              onSaved={close}
            />
          )}
        </div>
      )}
    </Modal>
  );
};
