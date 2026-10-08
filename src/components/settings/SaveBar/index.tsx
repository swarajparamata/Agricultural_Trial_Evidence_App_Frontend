import { useState } from 'react';
import { Button } from '@/components/ui';

interface SaveBarProps {
  isDirty: boolean;
  isSaving: boolean;
  error: string | null;
  message: string | null;
  onSave: () => void;
  onDiscard: () => void;
  /** Restores the section's defaults on the backend (asks for confirmation first). */
  onReset?: () => void;
}

/** Footer of a settings card: save state plus Save / Discard / Restore defaults. */
export const SaveBar = ({ isDirty, isSaving, error, message, onSave, onDiscard, onReset }: SaveBarProps) => {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <div className="mr-auto min-w-0 text-sm">
        {error ? (
          <p role="alert" className="text-red-600">
            {error}
          </p>
        ) : message ? (
          <p role="status" className="text-emerald-700">
            {message}
          </p>
        ) : isDirty ? (
          <p className="text-amber-700">Unsaved changes</p>
        ) : null}
      </div>
      {onReset &&
        (confirmReset ? (
          <span className="flex items-center gap-2 text-sm text-stone-600">
            Restore the defaults?
            <Button size="xs" variant="ghost" onClick={() => setConfirmReset(false)}>
              No
            </Button>
            <Button
              size="xs"
              variant="danger"
              disabled={isSaving}
              onClick={() => {
                setConfirmReset(false);
                onReset();
              }}
            >
              Restore
            </Button>
          </span>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setConfirmReset(true)} disabled={isSaving}>
            Restore defaults
          </Button>
        ))}
      <Button size="sm" variant="outline" onClick={onDiscard} disabled={!isDirty || isSaving}>
        Discard
      </Button>
      <Button size="sm" onClick={onSave} disabled={!isDirty || isSaving}>
        {isSaving ? 'Saving…' : 'Save changes'}
      </Button>
    </div>
  );
};
