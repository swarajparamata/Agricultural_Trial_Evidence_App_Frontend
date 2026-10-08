import { useAtomValue } from 'jotai';
import { settingsAtom } from '@/hooks';

interface SuggestedQuestionsProps {
  onPick: (question: string) => void;
  disabled: boolean;
}

/** One-click starter questions, configured under Settings → AI assistant. */
export const SuggestedQuestions = ({ onPick, disabled }: SuggestedQuestionsProps) => {
  const questions = useAtomValue(settingsAtom).assistant.suggested_questions;
  if (questions.length === 0) return null;

  return (
    <div className="border-t border-stone-100 bg-stone-50 px-4 py-3">
      <p className="mb-2 text-[11px] font-semibold tracking-wide text-stone-500 uppercase">Try asking</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((question) => (
          <button
            key={question}
            type="button"
            disabled={disabled}
            onClick={() => onPick(question)}
            className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-left text-xs text-emerald-800 transition-colors hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-500 disabled:opacity-50"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};
