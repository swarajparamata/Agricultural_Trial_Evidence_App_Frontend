import { create } from 'zustand';
import {
  CHAT_ERROR_MESSAGE,
  CHAT_HISTORY_LIMIT,
  INITIAL_CHAT_MESSAGE,
  OFFLINE_DEMO_CHAT_MESSAGE,
} from '@/constants';
import {
  ChatAnswerDataSchema,
  type AgentLog,
  type AgentLogStatus,
  type AssistantStatus,
  type ChatAnswerMeta,
  type ChatMessage,
} from '@/types';
import {
  api,
  createAgentLog,
  createChatMessage,
  errorMessage,
  getAppMode,
  type ChatHistoryTurn,
} from '@/utils';

interface ChatState {
  messages: ChatMessage[];
  logs: AgentLog[];
  isAgentTyping: boolean;
  /** Whether answers come from the LLM or the offline planner (null until checked or in the offline demo). */
  status: AssistantStatus | null;
  /** Sends `text` to the agent and streams its steps into the inspection log. */
  sendMessage: (text: string) => Promise<void>;
  loadStatus: () => Promise<void>;
  /** Starts a new conversation and cancels any in-flight agent run. */
  reset: () => void;
}

const initialState: Pick<ChatState, 'messages' | 'logs' | 'isAgentTyping'> = {
  messages: [INITIAL_CHAT_MESSAGE],
  logs: [],
  isAgentTyping: false,
};

let activeRun: AbortController | null = null;

const toMeta = (data: unknown): ChatAnswerMeta | undefined => {
  const parsed = ChatAnswerDataSchema.safeParse(data);
  if (!parsed.success) return undefined;
  const answer = parsed.data;
  return {
    mode: answer.mode,
    model: answer.model,
    verified: answer.verification.passed,
    trialIds: answer.trial_ids,
    sources: answer.sources,
    durationMs: answer.duration_ms,
    toolCalls: answer.tool_calls,
    revisions: answer.revisions,
  };
};

export const useChatStore = create<ChatState>()((set, get) => {
  const addMessage = (message: ChatMessage) => set((state) => ({ messages: [...state.messages, message] }));

  const addLog = (message: string, status: AgentLogStatus) =>
    set((state) => ({ logs: [...state.logs, createAgentLog(message, status)] }));

  return {
    ...initialState,
    status: null,

    sendMessage: async (rawText) => {
      const text = rawText.trim();
      if (!text || get().isAgentTyping) return;

      // Earlier turns give the agent context for follow-ups ("and in Germany?").
      const history: ChatHistoryTurn[] = get()
        .messages.filter((message) => message.id !== INITIAL_CHAT_MESSAGE.id && !message.isError)
        .slice(-CHAT_HISTORY_LIMIT)
        .map((message) => ({ role: message.role, content: message.text }));
      addMessage(createChatMessage('user', text));

      if (getAppMode() !== 'api') {
        addMessage(createChatMessage('model', OFFLINE_DEMO_CHAT_MESSAGE));
        addLog('[Demo] The assistant needs the backend; nothing was sent.', 'info');
        return;
      }

      const run = new AbortController();
      activeRun = run;
      set({ isAgentTyping: true });
      let answered = false;
      try {
        await api.assistant.streamChat(
          text,
          history,
          (event) => {
            if (run.signal.aborted) return;
            if (event.type === 'log') {
              addLog(event.message, event.status);
            } else if (event.type === 'answer') {
              answered = true;
              addMessage(createChatMessage('model', event.message, { meta: toMeta(event.data) }));
            } else if (event.type === 'error') {
              answered = true;
              addMessage(createChatMessage('model', event.message || CHAT_ERROR_MESSAGE, { isError: true }));
              addLog(`[Error] ${event.message}`, 'error');
            }
          },
          run.signal,
        );
        if (!answered && !run.signal.aborted) {
          addMessage(createChatMessage('model', CHAT_ERROR_MESSAGE, { isError: true }));
          addLog('[Error] The stream ended without an answer.', 'error');
        }
      } catch (error) {
        if (run.signal.aborted) return;
        console.error('Agent request failed:', error);
        addMessage(createChatMessage('model', errorMessage(error, CHAT_ERROR_MESSAGE), { isError: true }));
        addLog(`[Error] ${errorMessage(error)}`, 'error');
      } finally {
        if (activeRun === run) {
          activeRun = null;
          set({ isAgentTyping: false });
        }
      }
    },

    loadStatus: async () => {
      if (getAppMode() !== 'api') return;
      try {
        set({ status: await api.assistant.status() });
      } catch {
        set({ status: null });
      }
    },

    reset: () => {
      activeRun?.abort();
      activeRun = null;
      set(initialState);
    },
  };
});
