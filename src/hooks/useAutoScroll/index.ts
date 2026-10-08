import { useEffect, useRef } from 'react';

/** Scrolls the returned end-marker into view whenever `trigger` changes while `enabled`. */
export const useAutoScroll = <T extends HTMLElement = HTMLDivElement>(trigger: unknown, enabled = true) => {
  const endRef = useRef<T>(null);

  useEffect(() => {
    if (enabled) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [trigger, enabled]);

  return endRef;
};
