import { useAgentLogs, useAutoScroll, useChatStore } from '@/hooks';
import { cn, getChatPanelId, getChatTabId } from '@/utils';
import { AgentLogItem } from '../AgentLogItem';

interface AgentLogsPanelProps {
  isActive: boolean;
}

/** Live trace of the LangGraph run: planning, tool calls, verification and revisions. */
export const AgentLogsPanel = ({ isActive }: AgentLogsPanelProps) => {
  const logs = useAgentLogs();
  const isRunning = useChatStore((state) => state.isAgentTyping);
  const endRef = useAutoScroll(logs, isActive);

  return (
    <div
      role="tabpanel"
      id={getChatPanelId('logs')}
      aria-labelledby={getChatTabId('logs')}
      className={cn('flex min-h-0 flex-1 flex-col bg-slate-900', !isActive && 'hidden')}
    >
      <div className="flex items-center justify-between bg-slate-950 p-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
        <span>Agent Workflow Logs</span>
        <span className="flex items-center gap-1">
          <span
            className={cn(
              'inline-block size-1.5 rounded-full',
              isRunning ? 'animate-pulse bg-emerald-500' : 'bg-slate-600',
            )}
          />
          {isRunning ? 'Running' : 'Idle'}
        </span>
      </div>
      <div
        role="log"
        aria-label="Agent workflow"
        className="flex-1 space-y-3 overflow-y-auto p-4 font-mono text-xs"
      >
        {logs.length === 0 ? (
          <div className="mt-10 text-center text-slate-500 italic">
            Ask a question to watch the agent plan, call its tools and check its answer.
          </div>
        ) : (
          logs.map((log) => <AgentLogItem key={log.id} log={log} />)
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};
