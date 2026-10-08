import { useChatStore } from '@/hooks';
import type { AssistantMode } from '@/types';
import { cn, getAppMode } from '@/utils';

const MODE_STYLES: Record<
  AssistantMode | 'checking' | 'demo',
  { dot: string; label: (model: string | null) => string }
> = {
  llm: { dot: 'bg-emerald-400', label: (model) => model ?? 'LLM' },
  offline: { dot: 'bg-amber-400', label: () => 'Offline planner' },
  unavailable: { dot: 'bg-red-400', label: () => 'Unavailable' },
  disabled: { dot: 'bg-stone-400', label: () => 'Switched off' },
  checking: { dot: 'bg-stone-400 animate-pulse', label: () => 'Checking…' },
  demo: { dot: 'bg-amber-400', label: () => 'Needs backend' },
};

/** Which engine answers: Qwen via Ollama, the offline rule-based planner, or nothing. */
export const AssistantStatusBadge = () => {
  const status = useChatStore((state) => state.status);
  const key = getAppMode() !== 'api' ? 'demo' : (status?.mode ?? 'checking');
  const style = MODE_STYLES[key];

  return (
    <span
      title={status?.detail ?? (key === 'demo' ? 'The assistant runs on the backend' : undefined)}
      className="inline-flex max-w-44 items-center gap-1.5 rounded-full bg-emerald-950/40 px-2 py-0.5 text-[11px] font-medium text-emerald-100"
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', style.dot)} aria-hidden="true" />
      <span className="truncate">{style.label(status?.model ?? null)}</span>
    </span>
  );
};
