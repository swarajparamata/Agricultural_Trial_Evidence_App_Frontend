import type { z } from 'zod';
import type { FieldErrors } from '@/types';
import { ApiError } from '../api';

/** Collapses a ZodError into the first message per top-level field. */
export const getFieldErrors = <Output>(error: z.ZodError<Output>): FieldErrors<Output> => {
  const fieldErrors: FieldErrors<Output> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof Output | undefined;
    if (field !== undefined && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  return fieldErrors;
};

/**
 * Maps the backend's validation errors onto form field names. Custom-field errors arrive as
 * "custom_fields.<key>" and map to the form's "custom:<key>".
 */
export const apiFieldErrors = (error: unknown): Record<string, string> => {
  if (!(error instanceof ApiError)) return {};
  return Object.fromEntries(
    Object.entries(error.fieldErrors).map(([path, message]) => [
      path.startsWith('custom_fields.') ? `custom:${path.slice('custom_fields.'.length)}` : path,
      message,
    ]),
  );
};

/** Readable message for any failed request. */
export const errorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.'): string =>
  error instanceof Error && error.message ? error.message : fallback;

export const getFieldErrorId = (fieldId: string) => `${fieldId}-error`;

/** ARIA attributes that link a form control to its validation message. */
export const getFieldA11yProps = (fieldId: string, error?: string) => ({
  'aria-invalid': error ? true : undefined,
  'aria-describedby': error ? getFieldErrorId(fieldId) : undefined,
});
