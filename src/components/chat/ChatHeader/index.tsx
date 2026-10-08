import { Bot, RotateCcw, X } from 'lucide-react';
import { IconButton } from '@/components/ui';
import type { ChatTab } from '@/types';
import { AssistantStatusBadge } from '../AssistantStatusBadge';
import { ChatTabs } from '../ChatTabs';

interface ChatHeaderProps {
  activeTab: ChatTab;
  onTabChange: (tab: ChatTab) => void;
  onNewConversation: () => void;
  onClose: () => void;
}

export const ChatHeader = ({ activeTab, onTabChange, onNewConversation, onClose }: ChatHeaderProps) => (
  <div className="border-b border-emerald-800 bg-emerald-900 text-white">
    <div className="flex items-center justify-between gap-2 p-3">
      <div className="flex min-w-0 items-center gap-2">
        <Bot size={20} className="shrink-0 text-emerald-400" aria-hidden="true" />
        <span className="font-semibold">Evidence Assistant</span>
        <AssistantStatusBadge />
      </div>
      <div className="flex items-center gap-2">
        <IconButton
          icon={RotateCcw}
          iconSize={16}
          label="Start a new conversation"
          variant="inverse"
          onClick={onNewConversation}
        />
        <IconButton icon={X} label="Close assistant" variant="inverse" onClick={onClose} />
      </div>
    </div>
    <ChatTabs activeTab={activeTab} onTabChange={onTabChange} />
  </div>
);
