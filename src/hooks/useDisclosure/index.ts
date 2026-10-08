import { useAtom, type PrimitiveAtom } from 'jotai';
import { useCallback } from 'react';

/** Open / close / toggle helpers around a boolean atom (modals, menus, panels). */
export const useDisclosure = (isOpenAtom: PrimitiveAtom<boolean>) => {
  const [isOpen, setIsOpen] = useAtom(isOpenAtom);

  const open = useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = useCallback(() => setIsOpen(false), [setIsOpen]);
  const toggle = useCallback(() => setIsOpen((current) => !current), [setIsOpen]);

  return { isOpen, open, close, toggle };
};
