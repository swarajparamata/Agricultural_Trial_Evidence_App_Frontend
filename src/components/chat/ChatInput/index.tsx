import { ChevronUp } from 'lucide-react';
import { useState, type FormEvent } from 'react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [draft, setDraft] = useState('');
  const canSend = !disabled && draft.trim().length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSend) return;
    onSend(draft);
    setDraft('');
  };

  return (
    <div className="border-t border-stone-200 bg-white p-3">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about trials..."
          aria-label="Message the evidence assistant"
          disabled={disabled}
          className="w-full rounded-full border-none bg-stone-100 py-2.5 pr-10 pl-4 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="absolute right-1.5 rounded-full bg-emerald-600 p-1.5 text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          <ChevronUp size={16} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
};
