import { Activity, MessageSquare } from 'lucide-react';
import type { ChatMessage, ChatTabConfig } from '@/types';

export const INITIAL_CHAT_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'model',
  text: 'Hello! I am your AI Evidence Agent. Ask me about yields, products, conflicts between sources or the strength of the evidence.',
};

export const CHAT_ERROR_MESSAGE =
  'I encountered an error while trying to process the data. Please try again later.';

export const OFFLINE_DEMO_CHAT_MESSAGE =
  'The Evidence Assistant runs on the backend (FastAPI + LangGraph + Ollama/Qwen 3.6). Start the API and the LLM service and set VITE_API_BASE_URL to chat with it.';

export const CHAT_TABS: readonly ChatTabConfig[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'logs', label: 'Inspection', icon: Activity },
];

/** How many earlier messages are sent with a question so follow-ups make sense. */
export const CHAT_HISTORY_LIMIT = 12;
