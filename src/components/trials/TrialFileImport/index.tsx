import { FileUp, Sparkles, X } from 'lucide-react';
import { useRef, useState, type DragEvent } from 'react';
import { Badge, Button, Notice } from '@/components/ui';
import type { FileImportResult, ImportResponse } from '@/types';
import { api, cn, errorMessage, fmtBytes, plural } from '@/utils';

const ACCEPT = '.csv,.tsv,.txt,.md';

const ResultRow = ({ result }: { result: FileImportResult }) => {
  const llm = result.llm_extraction;
  return (
    <li className="rounded-lg border border-stone-200 p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-stone-800">{result.filename}</span>
        {result.error ? (
          <Badge tone="red">{result.error}</Badge>
        ) : (
          <>
            <Badge>{plural(result.records, 'record')}</Badge>
            {result.created.length > 0 && <Badge tone="emerald">new: {result.created.join(', ')}</Badge>}
            {result.updated.length > 0 && <Badge tone="sky">updated: {result.updated.join(', ')}</Badge>}
            {result.conflicts.length > 0 && (
              <Badge tone="red">conflicts: {result.conflicts.join(', ')}</Badge>
            )}
            {result.parser === 'report-llm' && (
              <Badge tone="violet">
                <Sparkles size={11} aria-hidden="true" /> read by the LLM
              </Badge>
            )}
          </>
        )}
      </div>
      {llm && !llm.ok && (
        <p className="mt-1 text-xs text-stone-500">
          LLM extraction unavailable: {Array.isArray(llm.issues) ? llm.issues.join('; ') : 'unknown reason'}
        </p>
      )}
      {result.warnings.length > 0 && (
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-amber-800">
          {result.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}
    </li>
  );
};

interface TrialFileImportProps {
  onImported: (response: ImportResponse) => void;
  /** Shows a Cancel button (Done after an import), e.g. inside a dialog. */
  onClose?: () => void;
}

/** Upload trial spreadsheets and reports; preview runs the whole pipeline without saving. */
export const TrialFileImport = ({ onImported, onClose }: TrialFileImportProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [busy, setBusy] = useState<'preview' | 'import' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const imported = result !== null && !result.dry_run;

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const added = Array.from(list);
    setFiles((current) => [
      ...current.filter((file) => !added.some((next) => next.name === file.name)),
      ...added,
    ]);
    setResult(null);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const run = async (dryRun: boolean) => {
    setBusy(dryRun ? 'preview' : 'import');
    setError(null);
    try {
      const response = await api.data.importFiles(files, dryRun);
      setResult(response);
      if (!dryRun) {
        setFiles([]);
        onImported(response);
      }
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors',
          isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-stone-300 bg-stone-50',
        )}
      >
        <FileUp size={28} className="text-emerald-600" aria-hidden="true" />
        <p className="text-sm text-stone-600">Drop files here, or</p>
        <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
          Choose files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="sr-only"
          aria-label="Choose files to import"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = '';
          }}
        />
        <p className="text-xs text-stone-500">.csv, .tsv, .txt or .md · up to 5 MB each</p>
      </div>

      {files.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {files.map((file) => (
            <li
              key={file.name}
              className="flex items-center justify-between gap-2 rounded-md bg-stone-50 px-3 py-1.5 text-sm"
            >
              <span className="truncate">
                {file.name} <span className="text-xs text-stone-500">({fmtBytes(file.size)})</span>
              </span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => setFiles((current) => current.filter((item) => item.name !== file.name))}
                className="text-stone-400 hover:text-red-600"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {result && (
        <div className="mt-5 space-y-2">
          <Notice tone={result.dry_run ? 'info' : 'success'}>
            {result.dry_run
              ? `Preview only – nothing was saved. Importing would give ${plural(result.trial_count, 'trial')} in total.`
              : `Imported. The dataset now has ${plural(result.trial_count, 'trial')}.`}
          </Notice>
          <ul className="space-y-2">
            {result.files.map((item) => (
              <ResultRow key={item.filename} result={item} />
            ))}
          </ul>
        </div>
      )}

      <div
        className={cn(
          'mt-4 flex flex-wrap items-center justify-end gap-3',
          onClose && 'border-t border-stone-100 pt-4',
        )}
      >
        {error && <p className="mr-auto text-sm text-red-600">{error}</p>}
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            {imported ? 'Done' : 'Cancel'}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={files.length === 0 || busy !== null}
          onClick={() => void run(true)}
        >
          {busy === 'preview' ? 'Checking…' : 'Preview import'}
        </Button>
        <Button size="sm" disabled={files.length === 0 || busy !== null} onClick={() => void run(false)}>
          {busy === 'import'
            ? 'Importing…'
            : `Import ${files.length > 0 ? plural(files.length, 'file') : ''}`}
        </Button>
      </div>
    </div>
  );
};
