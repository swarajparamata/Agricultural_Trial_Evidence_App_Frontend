import { useAgentChat } from '@/hooks';
import { cn, getChatPanelId, getChatTabId } from '@/utils';
import { ChatInput } from '../ChatInput';
import { ChatMessageList } from '../ChatMessageList';
import { SuggestedQuestions } from '../SuggestedQuestions';

interface ChatPanelProps {
  isActive: boolean;
}

export const ChatPanel = ({ isActive }: ChatPanelProps) => {
  const { messages, isAgentTyping, sendMessage } = useAgentChat();
  const isFreshConversation = messages.length <= 1;

  return (
    <div
      role="tabpanel"
      id={getChatPanelId('chat')}
      aria-labelledby={getChatTabId('chat')}
      className={cn('flex min-h-0 flex-1 flex-col', !isActive && 'hidden')}
    >
      <ChatMessageList messages={messages} isAgentTyping={isAgentTyping} isActive={isActive} />
      {isFreshConversation && <SuggestedQuestions onPick={sendMessage} disabled={isAgentTyping} />}
      <ChatInput onSend={sendMessage} disabled={isAgentTyping} />
    </div>
  );
};
