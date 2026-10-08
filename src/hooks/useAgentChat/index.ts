import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useChatStore } from '../stores';

/** Conversation state plus a `sendMessage` that streams the agent's answer. */
export const useAgentChat = () => {
  const { messages, isAgentTyping, sendToAgent } = useChatStore(
    useShallow((state) => ({
      messages: state.messages,
      isAgentTyping: state.isAgentTyping,
      sendToAgent: state.sendMessage,
    })),
  );

  const sendMessage = useCallback(
    (text: string) => {
      void sendToAgent(text);
    },
    [sendToAgent],
  );

  return { messages, isAgentTyping, sendMessage };
};
