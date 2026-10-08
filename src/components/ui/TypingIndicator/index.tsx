const DOT_DELAYS = ['0s', '0.2s', '0.4s'] as const;

export const TypingIndicator = () => (
  <div
    role="status"
    aria-label="Assistant is typing"
    className="flex items-center gap-2 rounded-2xl rounded-bl-xs border border-stone-200 bg-white px-4 py-3 text-stone-500 shadow-xs"
  >
    <span className="flex space-x-1">
      {DOT_DELAYS.map((delay) => (
        <span
          key={delay}
          className="size-1.5 animate-bounce rounded-full bg-stone-400"
          style={{ animationDelay: delay }}
        />
      ))}
    </span>
  </div>
);
