import { Bot, ChevronDown } from 'lucide-react';
import { cn } from '@/utils';

interface ChatToggleButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatToggleButton = ({ isOpen, onToggle }: ChatToggleButtonProps) => (
  <button
    type="button"
    onClick={onToggle}
    title="Toggle AI Agent"
    aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
    aria-expanded={isOpen}
    className={cn(
      'flex items-center justify-center rounded-full p-4 text-white shadow-2xl transition-all duration-300',
      isOpen ? 'bg-stone-800 hover:bg-stone-700' : 'bg-emerald-600 hover:scale-105 hover:bg-emerald-500',
    )}
  >
    {isOpen ? <ChevronDown size={24} aria-hidden="true" /> : <Bot size={28} aria-hidden="true" />}
  </button>
);
