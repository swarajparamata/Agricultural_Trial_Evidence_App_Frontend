import type { AuthCredentials, AuthMode, AuthModeCopy } from '@/types';

/** The backend rejects shorter passwords. */
export const MIN_PASSWORD_LENGTH = 6;

export const EMPTY_CREDENTIALS: AuthCredentials = { email: '', password: '' };

export const AUTH_MODE_COPY: Record<AuthMode, AuthModeCopy> = {
  signIn: {
    title: 'Sign in to your account',
    submit: 'Sign In',
    pending: 'Signing in…',
    switchPrompt: "Don't have an account?",
    switchAction: 'Sign Up',
  },
  signUp: {
    title: 'Create an Account',
    submit: 'Sign Up',
    pending: 'Creating account…',
    switchPrompt: 'Already have an account?',
    switchAction: 'Sign In',
  },
};

export const GENERIC_AUTH_ERROR = 'Something went wrong. Please try again.';

/** localStorage key holding the offline demo login's signed-in email. */
export const DEMO_SESSION_STORAGE_KEY = 'agrievidence:demo-session';

/** In the offline demo, emails starting with this get the admin role. */
export const DEMO_ADMIN_EMAIL_PREFIX = 'admin';
