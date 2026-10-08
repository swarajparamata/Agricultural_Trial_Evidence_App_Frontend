import { useEffect, useEffectEvent } from 'react';

export const useEscapeKey = (onEscape: () => void, enabled = true) => {
  const handleEscape = useEffectEvent(onEscape);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleEscape();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
};
