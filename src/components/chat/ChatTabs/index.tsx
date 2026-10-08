import { CHAT_TABS } from '@/constants';
import type { ChatTab } from '@/types';
import { cn, getChatPanelId, getChatTabId } from '@/utils';

interface ChatTabsProps {
  activeTab: ChatTab;
  onTabChange: (tab: ChatTab) => void;
}

export const ChatTabs = ({ activeTab, onTabChange }: ChatTabsProps) => (
  <div
    role="tablist"
    aria-label="Assistant views"
    className="flex border-t border-emerald-800/50 bg-emerald-950/30 text-sm font-medium"
  >
    {CHAT_TABS.map(({ id, label, icon: Icon }) => {
      const isActive = id === activeTab;
      return (
        <button
          key={id}
          type="button"
          role="tab"
          id={getChatTabId(id)}
          aria-selected={isActive}
          aria-controls={getChatPanelId(id)}
          onClick={() => onTabChange(id)}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 py-2 transition-colors',
            isActive ? 'bg-emerald-800 text-white' : 'text-emerald-400/80 hover:text-white',
          )}
        >
          <Icon size={16} aria-hidden="true" /> {label}
        </button>
      );
    })}
  </div>
);
