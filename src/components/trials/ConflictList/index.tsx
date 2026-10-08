import { CircleAlert, CircleCheck } from 'lucide-react';
import { useId, useState } from 'react';
import { Badge, Button, Notice, TextInput } from '@/components/ui';
import type { Trial } from '@/types';
import { api, cn, errorMessage } from '@/utils';

interface ConflictListProps {
  trial: Trial;
  /** Admins connected to the backend can pick the value to use. */
  canResolve: boolean;
  onChanged: (trial: Trial) => void;
}

/** Values the sources disagree on; nothing is hidden until an admin decides which one is right. */
export const ConflictList = ({ trial, canResolve, onChanged }: ConflictListProps) => {
  const [busyField, setBusyField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const noteId = useId();

  if (trial.conflicts.length === 0) return null;
  const hasOpen = trial.conflicts.some((conflict) => conflict.status === 'open');

  const run = async (field: string, request: () => Promise<Trial>) => {
    setBusyField(field);
    setError(null);
    try {
      onChanged(await request());
      setNote('');
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusyField(null);
    }
  };

  return (
    <section aria-labelledby={`${noteId}-heading`}>
      <h3 id={`${noteId}-heading`} className="mb-2 text-sm font-semibold text-stone-800">
        Conflicting sources
      </h3>
      {error && (
        <Notice tone="error" className="mb-2">
          {error}
        </Notice>
      )}
      <ul className="space-y-3">
        {trial.conflicts.map((conflict) => {
          const open = conflict.status === 'open';
          return (
            <li
              key={conflict.field}
              className={cn(
                'rounded-lg border p-3',
                open ? 'border-red-200 bg-red-50/40' : 'border-stone-200 bg-stone-50',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-stone-800">
                  {open ? (
                    <CircleAlert size={15} className="text-red-600" aria-hidden="true" />
                  ) : (
                    <CircleCheck size={15} className="text-emerald-700" aria-hidden="true" />
                  )}
                  {conflict.label}
                </p>
                <Badge tone={open ? 'red' : 'emerald'}>{open ? 'Open' : 'Resolved'}</Badge>
              </div>
              <ul className="mt-2 space-y-1.5">
                {conflict.candidates.map((candidate) => (
                  <li
                    key={candidate.display}
                    className="flex flex-wrap items-center justify-between gap-2 text-sm"
                  >
                    <span>
                      <span className="font-mono font-semibold text-stone-900">{candidate.display}</span>{' '}
                      <span className="text-stone-500">from {candidate.sources.join(', ')}</span>
                      {candidate.display === conflict.chosen_display && (
                        <Badge className="ml-2" tone="neutral">
                          shown
                        </Badge>
                      )}
                    </span>
                    {canResolve && open && (
                      <Button
                        size="xs"
                        variant="outline"
                        disabled={busyField !== null}
                        onClick={() =>
                          void run(conflict.field, () =>
                            api.trials.resolveConflict(
                              trial.id,
                              conflict.field,
                              candidate.value,
                              note.trim(),
                            ),
                          )
                        }
                      >
                        {busyField === conflict.field ? 'Saving…' : 'Use this value'}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
              {!open && (
                <p className="mt-2 text-xs text-stone-600">
                  Set by {conflict.resolved_by ?? 'an admin'}
                  {conflict.note && <> – “{conflict.note}”</>}
                  {canResolve && (
                    <Button
                      variant="link"
                      size="none"
                      className="ml-2 text-xs"
                      disabled={busyField !== null}
                      onClick={() =>
                        void run(conflict.field, () => api.trials.revertField(trial.id, conflict.field))
                      }
                    >
                      Reopen
                    </Button>
                  )}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      {canResolve && hasOpen && (
        <div className="mt-3">
          <label htmlFor={noteId} className="mb-1 block text-xs font-medium text-stone-600">
            Why this value? (kept in the activity log)
          </label>
          <TextInput
            id={noteId}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="e.g. the field report is the signed-off version"
          />
        </div>
      )}
    </section>
  );
};
