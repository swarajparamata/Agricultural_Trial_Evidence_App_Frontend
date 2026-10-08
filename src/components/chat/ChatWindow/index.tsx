import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { activeChatTabAtom, useChatStore } from '@/hooks';
import { AgentLogsPanel } from '../AgentLogsPanel';
import { ChatHeader } from '../ChatHeader';
import { ChatPanel } from '../ChatPanel';

interface ChatWindowProps {
  onClose: () => void;
}

export const ChatWindow = ({ onClose }: ChatWindowProps) => {
  const [activeTab, setActiveTab] = useAtom(activeChatTabAtom);
  const loadStatus = useChatStore((state) => state.loadStatus);
  const reset = useChatStore((state) => state.reset);

  // Re-check on every open whether answers will come from the LLM or the offline planner.
  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  return (
    <section
      aria-label="Evidence assistant"
      className="mb-4 flex h-[min(640px,calc(100vh-7rem))] w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200 sm:w-[28rem]"
    >
      <ChatHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewConversation={reset}
        onClose={onClose}
      />
      {/* Both panels stay mounted so the draft message and scroll position survive tab switches. */}
      <ChatPanel isActive={activeTab === 'chat'} />
      <AgentLogsPanel isActive={activeTab === 'logs'} />
    </section>
  );
};
