import { useSetAtom } from 'jotai';
import { FileText } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, Notice, Spinner } from '@/components/ui';
import { sourceFileAtom, useAsyncResource } from '@/hooks';
import type { SourceFile } from '@/types';
import { api, errorMessage, fmtBytes, fmtDateTime } from '@/utils';

interface SourceFilesCardProps {
  onChanged: () => void;
}

/** The imported files behind the trials; removing one rebuilds the trials it reported. */
export const SourceFilesCard = ({ onChanged }: SourceFilesCardProps) => {
  const { data: files, error, isLoading, reload } = useAsyncResource(api.data.files);
  const openSource = useSetAtom(sourceFileAtom);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const remove = async (file: SourceFile) => {
    setBusyId(file.id);
    setActionError(null);
    try {
      await api.data.removeFile(file.id);
      setConfirmId(null);
      reload();
      onChanged();
    } catch (requestError) {
      setActionError(errorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card title="Source files" description="Every trial value can be traced back to one of these files.">
      {actionError && (
        <Notice tone="error" className="mb-3">
          {actionError}
        </Notice>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      {isLoading && !files && <Spinner label="Loading files…" />}
      {files && files.length === 0 && <p className="text-sm text-stone-500">No files imported yet.</p>}
      {files && files.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 text-xs text-stone-500 uppercase">
              <tr>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  File
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Trials
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Imported
                </th>
                <th scope="col" className="py-2 pl-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id} className="border-b border-stone-100 align-top last:border-0">
                  <td className="py-3 pr-3">
                    <button
                      type="button"
                      onClick={() => openSource(file.filename)}
                      className="flex items-center gap-1.5 font-medium text-emerald-800 hover:underline"
                    >
                      <FileText size={14} aria-hidden="true" />
                      {file.filename}
                    </button>
                    <p className="mt-0.5 flex flex-wrap gap-1.5 text-xs text-stone-500">
                      {file.kind} · {fmtBytes(file.size_bytes)} · parser {file.parser}
                      {file.warnings.length > 0 && (
                        <Badge tone="amber" title={file.warnings.join('\n')}>
                          {file.warnings.length} warning{file.warnings.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-xs text-stone-600">{file.trial_ids.join(', ') || '–'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap text-stone-500">
                    {fmtDateTime(file.uploaded_at)}
                    <span className="block">{file.uploaded_by}</span>
                  </td>
                  <td className="py-3 pl-3 text-right">
                    {confirmId === file.id ? (
                      <span className="flex items-center justify-end gap-2 text-xs text-stone-600">
                        Remove it and its records?
                        <Button size="xs" variant="ghost" onClick={() => setConfirmId(null)}>
                          No
                        </Button>
                        <Button
                          size="xs"
                          variant="danger"
                          disabled={busyId === file.id}
                          onClick={() => void remove(file)}
                        >
                          Remove
                        </Button>
                      </span>
                    ) : (
                      <Button
                        size="xs"
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => setConfirmId(file.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
