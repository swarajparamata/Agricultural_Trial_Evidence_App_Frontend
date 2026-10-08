import { TypingIndicator } from '@/components/ui';
import { useAutoScroll } from '@/hooks';
import type { ChatMessage } from '@/types';
import { ChatMessageBubble } from '../ChatMessageBubble';

interface ChatMessageListProps {
  messages: readonly ChatMessage[];
  isAgentTyping: boolean;
  /** Auto-scroll only while the list is visible. */
  isActive: boolean;
}

export const ChatMessageList = ({ messages, isAgentTyping, isActive }: ChatMessageListProps) => {
  const endRef = useAutoScroll(messages, isActive);

  return (
    <div role="log" aria-label="Conversation" className="flex-1 space-y-4 overflow-y-auto bg-stone-50 p-4">
      {messages.map((message) => (
        <ChatMessageBubble key={message.id} message={message} />
      ))}
      {isAgentTyping && (
        <div className="flex justify-start">
          <TypingIndicator />
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
};
