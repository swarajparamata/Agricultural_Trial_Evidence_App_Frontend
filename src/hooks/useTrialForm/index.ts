import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useMemo, useState, type FormEvent } from 'react';
import type { Trial, TrialFormValues } from '@/types';
import {
  api,
  apiFieldErrors,
  buildDemoTrial,
  buildTrialFormFields,
  createTrialFormSchema,
  emptyTrialForm,
  errorMessage,
  getAppMode,
  getFieldErrors,
  toTrialUpdate,
  trialToFormValues,
  type TrialFormMode,
} from '@/utils';
import { addTrialDraftAtom, settingsAtom, trialsAtom, upsertTrialAtom } from '../atoms';
import { useAuthStore } from '../stores';

/**
 * State of the add/edit trial form. Adding keeps a draft that survives closing the dialog; editing
 * sends only the changed fields, so untouched imported values stay linked to their sources.
 */
export const useTrialForm = (mode: TrialFormMode, trial: Trial | null, onSaved: (trial: Trial) => void) => {
  const settings = useAtomValue(settingsAtom);
  const trials = useAtomValue(trialsAtom);
  const upsertTrial = useSetAtom(upsertTrialAtom);
  const actor = useAuthStore((state) => state.user?.email ?? 'demo');
  const [draft, setDraft] = useAtom(addTrialDraftAtom);

  const initial = useMemo(
    () => (mode === 'edit' && trial ? trialToFormValues(trial, settings) : emptyTrialForm(settings)),
    [mode, trial, settings],
  );
  const [editValues, setEditValues] = useState<TrialFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const values = mode === 'create' ? (draft ?? initial) : editValues;
  const fields = useMemo(() => buildTrialFormFields(settings, mode), [settings, mode]);

  const setField = (name: string, value: string) => {
    if (mode === 'create') setDraft({ ...values, [name]: value });
    else setEditValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const otherIds = trials.map((existing) => existing.id).filter((id) => id !== trial?.id);
    const result = createTrialFormSchema(settings, otherIds, mode).safeParse(values);
    if (!result.success) {
      setErrors(getFieldErrors(result.error) as Record<string, string>);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      const { input, reason } = result.data;
      let saved: Trial;
      if (getAppMode() !== 'api') {
        saved = buildDemoTrial(input, settings, actor);
      } else if (mode === 'create') {
        saved = await api.trials.create(input);
      } else {
        saved = await api.trials.update(trial?.id ?? '', toTrialUpdate(initial, values, input, reason));
      }
      upsertTrial(saved);
      if (mode === 'create') setDraft(null);
      setErrors({});
      onSaved(saved);
    } catch (error) {
      setErrors(apiFieldErrors(error));
      setFormError(errorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { fields, values, errors, formError, isSubmitting, setField, handleSubmit };
};
