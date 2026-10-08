import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { useEscapeKey } from '@/hooks';
import { cn } from '@/utils';
import { IconButton } from '../IconButton';

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
} as const;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Short line under the title. */
  subtitle?: ReactNode;
  titleClassName?: string;
  bodyClassName?: string;
  size?: keyof typeof SIZE_CLASSES;
  children: ReactNode;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  titleClassName,
  bodyClassName,
  size = 'md',
  children,
}: ModalProps) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEscapeKey(onClose, isOpen);

  // Move focus into the dialog while it is open and give it back to the trigger afterwards.
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();
    return () => previouslyFocused?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'flex max-h-[90vh] w-full flex-col rounded-2xl bg-white shadow-2xl outline-hidden animate-in fade-in zoom-in-95 duration-200',
          SIZE_CLASSES[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 rounded-t-2xl border-b border-stone-100 bg-stone-50 p-5">
          <div className="min-w-0">
            <h2
              id={titleId}
              className={cn('flex items-center gap-2 text-xl font-bold text-stone-800', titleClassName)}
            >
              {title}
            </h2>
            {subtitle && <div className="mt-1 text-sm text-stone-500">{subtitle}</div>}
          </div>
          <IconButton icon={X} label="Close dialog" onClick={onClose} />
        </div>
        <div className={cn('flex-1 overflow-y-auto rounded-b-2xl p-6', bodyClassName)}>{children}</div>
      </div>
    </div>
  );
};
