import type { ChatMessage, ChatRole } from '@/types';
import { cn } from '@/utils';
import { AnswerMeta } from '../AnswerMeta';
import { MarkdownMessage } from '../MarkdownMessage';

const ROLE_CLASSES: Record<ChatRole, { row: string; bubble: string }> = {
  user: {
    row: 'justify-end',
    bubble: 'max-w-[85%] rounded-br-xs bg-emerald-600 text-white',
  },
  model: {
    row: 'justify-start',
    bubble: 'max-w-[92%] rounded-bl-xs border border-stone-200 bg-white text-stone-800 shadow-xs',
  },
};

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export const ChatMessageBubble = ({ message }: ChatMessageBubbleProps) => {
  const classes = ROLE_CLASSES[message.role];

  return (
    <div className={cn('flex', classes.row)}>
      <div
        className={cn(
          'rounded-2xl px-4 py-2.5',
          classes.bubble,
          message.isError && 'border-red-200 bg-red-50 text-red-800',
        )}
      >
        {message.role === 'model' ? (
          <MarkdownMessage text={message.text} />
        ) : (
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.text}</p>
        )}
        {message.meta && <AnswerMeta meta={message.meta} />}
      </div>
    </div>
  );
};
