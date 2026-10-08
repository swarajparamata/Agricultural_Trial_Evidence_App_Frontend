import { useAtom } from 'jotai';
import { FileText } from 'lucide-react';
import { Modal, Notice, Spinner } from '@/components/ui';
import { sourceFileAtom, useAsyncResource } from '@/hooks';
import { api, fmtDateTime } from '@/utils';

/** Splits CSV text into rows, honouring quoted cells ("a, b") and doubled quotes. */
const parseCsv = (text: string): string[][] => {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  const delimiter = [',', ';', '\t'].reduce((best, candidate) =>
    firstLine.split(candidate).length > firstLine.split(best).length ? candidate : best,
  );
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell || row.length) rows.push([...row, cell]);
  return rows.filter((cells) => cells.some((value) => value.trim()));
};

const SourceContentView = ({ filename }: { filename: string }) => {
  const { data, error, isLoading } = useAsyncResource(() => api.sources.get(filename));

  if (isLoading) return <Spinner label="Loading the source file…" />;
  if (error || !data) return <Notice tone="error">{error ?? 'The file could not be loaded.'}</Notice>;

  const isCsv = data.kind === 'csv';
  const rows = isCsv ? parseCsv(data.content) : [];
  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-500">
        {isCsv ? 'Spreadsheet' : 'Text report'} · imported {fmtDateTime(data.uploaded_at)} by{' '}
        {data.uploaded_by} · parser {data.parser}
      </p>
      {isCsv && rows.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-600">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold text-stone-400">
                  Row
                </th>
                {(rows[0] ?? []).map((header, index) => (
                  <th key={index} scope="col" className="px-3 py-2 font-semibold whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((cells, rowIndex) => (
                <tr key={rowIndex} className="border-b border-stone-100 last:border-0">
                  <td className="px-3 py-2 text-stone-400 tabular-nums">{rowIndex + 2}</td>
                  {cells.map((value, index) => (
                    <td key={index} className="px-3 py-2 font-mono whitespace-nowrap text-stone-700">
                      {value || <span className="text-stone-300">(empty)</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <pre className="max-h-[60vh] overflow-auto rounded-lg border border-stone-200 bg-stone-50 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-stone-800">
          {data.content}
        </pre>
      )}
    </div>
  );
};

/** The original imported file behind a trial, for checking where each value came from. */
export const SourceViewerModal = () => {
  const [filename, setFilename] = useAtom(sourceFileAtom);

  return (
    <Modal
      isOpen={filename !== null}
      onClose={() => setFilename(null)}
      size="lg"
      title={
        <>
          <FileText size={20} className="text-emerald-600" aria-hidden="true" />
          {filename}
        </>
      }
    >
      {filename && <SourceContentView key={filename} filename={filename} />}
    </Modal>
  );
};
