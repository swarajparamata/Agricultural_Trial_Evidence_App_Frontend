import type { ReactNode } from 'react';
import { cn } from '@/utils';

interface CardProps {
  title?: ReactNode;
  description?: ReactNode;
  /** Buttons at the top right. */
  actions?: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

export const Card = ({
  title,
  description,
  actions,
  footer,
  className,
  bodyClassName,
  children,
}: CardProps) => (
  <section className={cn('rounded-xl border border-stone-200 bg-white shadow-xs', className)}>
    {(title || actions) && (
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 px-5 py-4">
        <div className="min-w-0">
          {title && <h2 className="text-base font-semibold text-stone-800">{title}</h2>}
          {description && <p className="mt-0.5 text-sm leading-relaxed text-stone-500">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </header>
    )}
    <div className={cn('p-5', bodyClassName)}>{children}</div>
    {footer && <footer className="border-t border-stone-100 px-5 py-3">{footer}</footer>}
  </section>
);
