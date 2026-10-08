import { useEffect, useEffectEvent, type RefObject } from 'react';

export const useClickOutside = (
  ref: RefObject<HTMLElement | null>,
  onOutsideClick: () => void,
  enabled = true,
) => {
  const handleOutsideClick = useEffectEvent(onOutsideClick);

  useEffect(() => {
    if (!enabled) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) handleOutsideClick();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [ref, enabled]);
};
