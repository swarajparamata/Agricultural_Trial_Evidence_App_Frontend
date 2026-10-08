import { useSetAtom } from 'jotai';
import { FileText, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui';
import { CORE_FIELD_LABELS, EDITABLE_CORE_FIELDS } from '@/constants';
import { sourceFileAtom } from '@/hooks';
import type { Trial } from '@/types';
import { cn, getAppMode, openConflicts } from '@/utils';

interface SourceListProps {
  trial: Trial;
}

/** Every source of the trial and the values it reported, exactly as written in that file. */
export const SourceList = ({ trial }: SourceListProps) => {
  const openSource = useSetAtom(sourceFileAtom);
  const canOpen = getAppMode() === 'api';
  const conflicting = new Set(openConflicts(trial).map((conflict) => conflict.field));

  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-stone-800">
        Sources{' '}
        <span className="font-normal text-stone-500">
          ({trial.sources.length}) – values as each source wrote them
        </span>
      </h3>
      <div className="overflow-x-auto rounded-lg border border-stone-200">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
            <tr>
              <th scope="col" className="px-3 py-2 font-semibold">
                Source
              </th>
              {EDITABLE_CORE_FIELDS.map((field) => (
                <th key={field} scope="col" className="px-3 py-2 font-semibold whitespace-nowrap">
                  {CORE_FIELD_LABELS[field]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trial.sources.map((source) => (
              <tr
                key={`${source.file}-${source.locator}`}
                className="border-b border-stone-100 last:border-0"
              >
                <th scope="row" className="px-3 py-2 text-left font-normal">
                  <span className="flex items-center gap-1.5">
                    <FileText size={13} className="shrink-0 text-emerald-600/70" aria-hidden="true" />
                    {canOpen && source.kind !== 'manual' ? (
                      <button
                        type="button"
                        onClick={() => openSource(source.file)}
                        className="font-medium text-emerald-800 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-500"
                      >
                        {source.file}
                      </button>
                    ) : (
                      <span className="font-medium text-stone-800">{source.file}</span>
                    )}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-stone-500">
                    {source.kind}
                    {source.locator && ` · ${source.locator}`}
                    {source.extraction === 'llm' && (
                      <Badge tone="violet" title="Read from free text by the LLM extraction loop">
                        <Sparkles size={10} aria-hidden="true" /> AI-extracted
                      </Badge>
                    )}
                  </span>
                </th>
                {EDITABLE_CORE_FIELDS.map((field) => (
                  <td
                    key={field}
                    className={cn(
                      'px-3 py-2 font-mono whitespace-nowrap text-stone-700',
                      conflicting.has(field) && 'font-semibold text-red-700',
                    )}
                  >
                    {source.values[field] ?? <span className="text-stone-300">–</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
