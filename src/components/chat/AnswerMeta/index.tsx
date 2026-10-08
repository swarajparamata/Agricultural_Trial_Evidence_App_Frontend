import { useSetAtom } from 'jotai';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { sourceFileAtom } from '@/hooks';
import type { ChatAnswerMeta } from '@/types';
import { cn, getAppMode, plural } from '@/utils';

/** How an answer was produced: model, fact-check result, tool calls and the sources it cites. */
export const AnswerMeta = ({ meta }: { meta: ChatAnswerMeta }) => {
  const openSource = useSetAtom(sourceFileAtom);
  const canOpen = getAppMode() === 'api';

  return (
    <div className="mt-2 space-y-1.5 border-t border-stone-100 pt-2 text-[11px] text-stone-500">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className={cn(
            'inline-flex items-center gap-1 font-medium',
            meta.verified ? 'text-emerald-700' : 'text-amber-700',
          )}
          title={
            meta.verified
              ? 'Every number, trial ID and caveat was checked against the tool results'
              : 'Some statements could not be checked against the data'
          }
        >
          {meta.verified ? (
            <ShieldCheck size={12} aria-hidden="true" />
          ) : (
            <ShieldAlert size={12} aria-hidden="true" />
          )}
          {meta.verified ? 'Fact-checked' : 'Not fully verified'}
        </span>
        <span>· {meta.mode === 'llm' ? meta.model : 'offline planner'}</span>
        <span>· {plural(meta.toolCalls, 'tool call')}</span>
        {meta.revisions > 0 && <span>· {plural(meta.revisions, 'revision')}</span>}
        <span>· {(meta.durationMs / 1000).toFixed(1)} s</span>
      </p>
      {meta.sources.length > 0 && (
        <p className="flex flex-wrap items-center gap-1">
          <span>Sources:</span>
          {meta.sources.map((source) =>
            canOpen ? (
              <button
                key={source}
                type="button"
                onClick={() => openSource(source)}
                className="rounded-sm bg-stone-100 px-1.5 py-0.5 font-mono text-stone-600 hover:bg-emerald-50 hover:text-emerald-800"
              >
                {source}
              </button>
            ) : (
              <span key={source} className="rounded-sm bg-stone-100 px-1.5 py-0.5 font-mono">
                {source}
              </span>
            ),
          )}
        </p>
      )}
    </div>
  );
};
