import type { ReactNode } from 'react';
import { getFieldErrorId } from '@/utils';
import { Label } from '../Label';

interface FormFieldProps {
  /** Id of the control rendered as `children`; also links the error message to it. */
  id: string;
  label: string;
  /** Help text under the control, hidden while an error is shown. */
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export const FormField = ({ id, label, hint, error, className, children }: FormFieldProps) => (
  <div className={className}>
    <Label htmlFor={id} className="mb-1">
      {label}
    </Label>
    {children}
    {error ? (
      <p id={getFieldErrorId(id)} className="mt-1 text-xs text-red-600">
        {error}
      </p>
    ) : (
      hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>
    )}
  </div>
);
