import { useEffect, useRef, useState } from 'react';

/** Width of the returned element in CSS pixels, kept up to date as it resizes (0 until measured). */
export const useElementWidth = <T extends HTMLElement = HTMLDivElement>() => {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
};
