import { useState } from 'react';
import { Button, Card, Notice } from '@/components/ui';
import { useAsyncResource } from '@/hooks';
import { api, errorMessage, plural } from '@/utils';

type Task = 'rebuild' | 'sample' | 'reset';

interface MaintenanceCardProps {
  /** Called after any task, with whether the settings changed too. */
  onDone: (settingsChanged: boolean) => void;
}

/** Re-run the data pipeline, re-import the sample files, or put the demo back to its first-run state. */
export const MaintenanceCard = ({ onDone }: MaintenanceCardProps) => {
  const { data: meta } = useAsyncResource(api.meta);
  const [busy, setBusy] = useState<Task | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [result, setResult] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const run = async (task: Task) => {
    setBusy(task);
    setResult(null);
    try {
      if (task === 'rebuild') {
        const rebuilt = await api.data.rebuild();
        setResult({
          tone: 'success',
          text: `Rebuilt ${plural(rebuilt.trials, 'trial')} from ${plural(rebuilt.files, 'file')}; ${plural(rebuilt.conflicts, 'trial')} with conflicts.`,
        });
      } else if (task === 'sample') {
        const imported = await api.data.importSample();
        setResult({ tone: 'success', text: `Re-imported ${plural(imported.files.length, 'sample file')}.` });
      } else {
        await api.resetDemo();
        setResult({ tone: 'success', text: 'The demo is back to its first-run state.' });
      }
      onDone(task === 'reset');
    } catch (error) {
      setResult({ tone: 'error', text: errorMessage(error) });
    } finally {
      setBusy(null);
      setConfirmReset(false);
    }
  };

  return (
    <Card title="Maintenance">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-stone-800">Rebuild all trials</p>
            <p className="text-xs text-stone-500">
              Re-reads every stored file with the current import rules and vocabulary.
            </p>
          </div>
          <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => void run('rebuild')}>
            {busy === 'rebuild' ? 'Rebuilding…' : 'Rebuild'}
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-stone-800">Re-import the sample data</p>
            <p className="text-xs text-stone-500">
              Replaces the bundled sample files with fresh copies; other files stay.
            </p>
          </div>
          <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => void run('sample')}>
            {busy === 'sample' ? 'Importing…' : 'Re-import'}
          </Button>
        </div>
        {meta?.demo_mode && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div>
              <p className="text-sm font-medium text-amber-900">Reset the demo</p>
              <p className="text-xs text-amber-800">
                Deletes all trials, imports, admin changes and settings, restores the sample data and the demo
                passwords. Use it before a presentation.
              </p>
            </div>
            {confirmReset ? (
              <span className="flex items-center gap-2 text-sm text-amber-900">
                Sure?
                <Button size="xs" variant="ghost" onClick={() => setConfirmReset(false)}>
                  No
                </Button>
                <Button size="xs" variant="danger" disabled={busy !== null} onClick={() => void run('reset')}>
                  {busy === 'reset' ? 'Resetting…' : 'Reset demo'}
                </Button>
              </span>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={busy !== null}
                onClick={() => setConfirmReset(true)}
              >
                Reset demo…
              </Button>
            )}
          </div>
        )}
        {result && <Notice tone={result.tone}>{result.text}</Notice>}
      </div>
    </Card>
  );
};
