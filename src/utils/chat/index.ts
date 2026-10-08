import type { AgentLog, AgentLogStatus, ChatAnswerMeta, ChatMessage, ChatRole, ChatTab } from '@/types';
import { createId } from '../id';
import { formatClockTime } from '../time';

export const createChatMessage = (
  role: ChatRole,
  text: string,
  extra: { meta?: ChatAnswerMeta; isError?: boolean } = {},
): ChatMessage => ({
  id: createId(),
  role,
  text,
  ...extra,
});

export const createAgentLog = (message: string, status: AgentLogStatus = 'info'): AgentLog => ({
  id: createId(),
  time: formatClockTime(),
  message,
  status,
});

/** DOM ids that tie each chat tab to its panel for assistive technology. */
export const getChatTabId = (tab: ChatTab) => `chat-tab-${tab}`;

export const getChatPanelId = (tab: ChatTab) => `chat-panel-${tab}`;
