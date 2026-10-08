import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { Button, Card, Notice } from '@/components/ui';
import { upsertTrialAtom, useAsyncResource } from '@/hooks';
import { api, errorMessage, fmtDateTime } from '@/utils';

/** Trials an admin deleted; imported ones stay out of rebuilds until restored here. */
export const DeletedTrialsCard = () => {
  const { data: deleted, error, reload } = useAsyncResource(api.trials.deleted);
  const upsertTrial = useSetAtom(upsertTrialAtom);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!deleted || deleted.length === 0) return error ? <Notice tone="error">{error}</Notice> : null;

  const restore = async (id: string) => {
    setBusyId(id);
    setActionError(null);
    try {
      upsertTrial(await api.trials.restore(id));
      reload();
    } catch (requestError) {
      setActionError(errorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card
      title="Deleted trials"
      description="Imported trials that were deleted stay hidden, even after a rebuild, until restored."
    >
      {actionError && (
        <Notice tone="error" className="mb-3">
          {actionError}
        </Notice>
      )}
      <ul className="divide-y divide-stone-100">
        {deleted.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span>
              <span className="font-medium text-stone-800">{item.id}</span>
              <span className="ml-2 text-xs text-stone-500">
                deleted by {item.deleted_by} · {fmtDateTime(item.deleted_at)}
              </span>
            </span>
            <Button
              size="xs"
              variant="outline"
              disabled={busyId !== null}
              onClick={() => void restore(item.id)}
            >
              {busyId === item.id ? 'Restoring…' : 'Restore'}
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
};
