import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Pencil, Trash2, TriangleAlert, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Modal, Notice, Spinner } from '@/components/ui';
import {
  detailTrialIdAtom,
  removeTrialAtom,
  settingsAtom,
  trialFormAtom,
  trialsAtom,
  upsertTrialAtom,
  useAsyncResource,
  useIsAdmin,
} from '@/hooks';
import type { Trial } from '@/types';
import {
  api,
  describeTrial,
  errorMessage,
  fmtDateTime,
  fmtPct,
  fmtYield,
  formatCustomValue,
  getAppMode,
} from '@/utils';
import { ConflictList } from '../ConflictList';
import { KpiTile } from '../KpiTile';
import { SourceList } from '../SourceList';
import { StatusBadge } from '../StatusBadge';
import { TrialTypeBadge } from '../TrialTypeBadge';

/** Admin overrides with who set them and why (needs the detail endpoint). */
const AdminChanges = ({ trial, onChanged }: { trial: Trial; onChanged: (trial: Trial) => void }) => {
  const { data, error, isLoading } = useAsyncResource(() => api.trials.get(trial.id));
  const [busy, setBusy] = useState<string | null>(null);
  const [revertError, setRevertError] = useState<string | null>(null);
  const settings = useAtomValue(settingsAtom);

  if (isLoading) return <Spinner label="Loading admin changes…" />;
  if (error) return <Notice tone="error">{error}</Notice>;
  const overrides = data?.overrides ?? [];
  if (overrides.length === 0) return null;

  const label = (field: string) => {
    const definition = settings.custom_fields.fields.find((item) => `custom:${item.key}` === field);
    return definition?.label ?? field.replace(/_/g, ' ');
  };

  const revert = async (field: string) => {
    setBusy(field);
    setRevertError(null);
    try {
      onChanged(await api.trials.revertField(trial.id, field));
    } catch (requestError) {
      setRevertError(errorMessage(requestError));
      setBusy(null);
    }
  };

  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-stone-800">Admin changes</h3>
      {revertError && (
        <Notice tone="error" className="mb-2">
          {revertError}
        </Notice>
      )}
      <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200">
        {overrides.map((override) => (
          <li
            key={override.field}
            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
          >
            <span>
              <span className="font-medium capitalize text-stone-800">{label(override.field)}</span>:{' '}
              {override.display}
              <span className="block text-xs text-stone-500">
                {override.updated_by} · {fmtDateTime(override.updated_at)}
                {override.note && <> · “{override.note}”</>}
              </span>
            </span>
            <Button
              size="xs"
              variant="outline"
              disabled={busy !== null}
              onClick={() => void revert(override.field)}
            >
              <Undo2 size={13} aria-hidden="true" />
              {busy === override.field ? 'Reverting…' : 'Revert to source'}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
};

const DetailBody = ({ trial, onClose }: { trial: Trial; onClose: () => void }) => {
  const settings = useAtomValue(settingsAtom);
  const isAdmin = useIsAdmin();
  const isApi = getAppMode() === 'api';
  const upsertTrial = useSetAtom(upsertTrialAtom);
  const removeTrial = useSetAtom(removeTrialAtom);
  const setTrialForm = useSetAtom(trialFormAtom);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const decimals = settings.display.decimals;
  const caveats = trial.caveats.filter((caveat) => !caveat.startsWith('Conflicting'));

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      if (isApi) await api.trials.remove(trial.id);
      removeTrial(trial.id);
      onClose();
    } catch (error) {
      setDeleteError(errorMessage(error));
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={trial.status} />
        <TrialTypeBadge type={trial.trial_type} />
        {trial.origin === 'manual' && <Badge>Manual entry</Badge>}
        {trial.overridden_fields.length > 0 && <Badge tone="violet">Edited by an admin</Badge>}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiTile label="Treated yield" value={fmtYield(trial.treatment_yield, trial.yield_unit, decimals)} />
        <KpiTile label="Control yield" value={fmtYield(trial.control_yield, trial.yield_unit, decimals)} />
        <KpiTile
          label="Uplift vs control"
          value={fmtPct(trial.uplift_pct)}
          detail={
            trial.uplift_range
              ? `${fmtPct(trial.uplift_range[0])} to ${fmtPct(trial.uplift_range[1])} given the conflicting sources`
              : trial.yield_difference !== null
                ? `${trial.yield_difference > 0 ? '+' : ''}${fmtYield(trial.yield_difference, trial.yield_unit, decimals)}`
                : 'needs both yields'
          }
        />
      </div>

      {caveats.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-stone-800">Evidence caveats</h3>
          <ul className="space-y-1.5">
            {caveats.map((caveat) => (
              <li key={caveat} className="flex items-start gap-2 text-sm text-stone-700">
                <TriangleAlert size={15} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
                {caveat}
              </li>
            ))}
          </ul>
        </section>
      )}

      <ConflictList trial={trial} canResolve={isAdmin && isApi} onChanged={upsertTrial} />

      <SourceList trial={trial} />

      {trial.notes.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-stone-800">Notes</h3>
          <ul className="space-y-2">
            {trial.notes.map((note) => (
              <li
                key={`${note.source}-${note.text}`}
                className="rounded-lg border-l-2 border-emerald-500 bg-stone-50 px-3 py-2 text-sm text-stone-700"
              >
                “{note.text}”<span className="mt-0.5 block text-xs text-stone-500">— {note.source}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {settings.custom_fields.fields.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-stone-800">Custom fields</h3>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {settings.custom_fields.fields.map((definition) => (
              <div key={definition.key} className="flex justify-between gap-3 border-b border-stone-100 pb-1">
                <dt className="text-stone-500">{definition.label}</dt>
                <dd className="font-medium text-stone-800">
                  {formatCustomValue(definition, trial.custom_fields[definition.key], decimals)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {isAdmin && isApi && trial.overridden_fields.length > 0 && (
        <AdminChanges key={trial.updated_at} trial={trial} onChanged={upsertTrial} />
      )}

      <p className="text-xs text-stone-400">Last updated {fmtDateTime(trial.updated_at)}</p>

      {isAdmin && (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-stone-100 pt-4">
          {deleteError && <p className="mr-auto text-sm text-red-600">{deleteError}</p>}
          {confirmDelete ? (
            <>
              <span className="text-sm text-stone-700">
                Delete {trial.id}?{' '}
                {trial.origin === 'ingested' && 'It stays out of future imports until restored.'}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={() => void handleDelete()} disabled={isDeleting}>
                {isDeleting ? 'Deleting…' : 'Delete trial'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 size={15} aria-hidden="true" /> Delete
              </Button>
              {isApi && (
                <Button size="sm" onClick={() => setTrialForm({ mode: 'edit', trialId: trial.id })}>
                  <Pencil size={15} aria-hidden="true" /> Edit trial
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

/** Everything known about one trial: values, caveats, conflicts and where each value came from. */
export const TrialDetailModal = () => {
  const [trialId, setTrialId] = useAtom(detailTrialIdAtom);
  const trial = useAtomValue(trialsAtom).find((item) => item.id === trialId) ?? null;
  const close = () => setTrialId(null);

  return (
    <Modal
      isOpen={trial !== null}
      onClose={close}
      size="lg"
      title={trial ? `${trial.id} – ${describeTrial(trial)}` : ''}
      subtitle={trial ? [trial.country, trial.year].filter(Boolean).join(' · ') : undefined}
    >
      {trial && <DetailBody key={trial.id} trial={trial} onClose={close} />}
    </Modal>
  );
};
