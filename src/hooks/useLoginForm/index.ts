import { useState, type FormEvent } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { EMPTY_CREDENTIALS } from '@/constants';
import { SignInSchema, SignUpSchema, type AuthCredentials, type AuthMode, type FieldErrors } from '@/types';
import { getFieldErrors } from '@/utils';
import { useAuthStore } from '../stores';

export const useLoginForm = () => {
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [values, setValues] = useState<AuthCredentials>(EMPTY_CREDENTIALS);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<AuthCredentials>>({});
  const { authError, isSubmitting, signIn, signUp, clearError } = useAuthStore(
    useShallow((state) => ({
      authError: state.error,
      isSubmitting: state.isSubmitting,
      signIn: state.signIn,
      signUp: state.signUp,
      clearError: state.clearError,
    })),
  );

  const setField = (field: keyof AuthCredentials, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  /** Puts a demo account's credentials in the form (and switches to sign-in). */
  const fillCredentials = (credentials: AuthCredentials) => {
    setMode('signIn');
    setValues(credentials);
    setFieldErrors({});
    clearError();
  };

  const toggleMode = () => {
    setMode((current) => (current === 'signIn' ? 'signUp' : 'signIn'));
    setFieldErrors({});
    clearError();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = (mode === 'signUp' ? SignUpSchema : SignInSchema).safeParse(values);
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error));
      return;
    }

    void (mode === 'signUp' ? signUp : signIn)(result.data);
  };

  return {
    mode,
    values,
    fieldErrors,
    authError,
    isSubmitting,
    setField,
    fillCredentials,
    toggleMode,
    handleSubmit,
  };
};
