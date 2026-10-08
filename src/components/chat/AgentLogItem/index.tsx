import type { AgentLog, AgentLogStatus } from '@/types';
import { cn } from '@/utils';

const STATUS_CLASSES: Record<AgentLogStatus, { border: string; text: string }> = {
  info: { border: 'border-slate-500', text: 'text-slate-300' },
  processing: { border: 'border-blue-500', text: 'text-blue-400' },
  success: { border: 'border-emerald-500', text: 'text-emerald-400' },
  error: { border: 'border-red-500', text: 'text-red-400' },
};

interface AgentLogItemProps {
  log: AgentLog;
}

export const AgentLogItem = ({ log }: AgentLogItemProps) => {
  const classes = STATUS_CLASSES[log.status];

  return (
    <div className={cn('flex items-start gap-2 border-l-2 py-0.5 pl-2', classes.border)}>
      <span className="shrink-0 text-slate-500">[{log.time}]</span>
      <span className={cn('flex-1 break-words', classes.text)}>{log.message}</span>
    </div>
  );
};
