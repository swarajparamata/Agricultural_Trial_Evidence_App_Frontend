import { z } from 'zod';
import { MIN_PASSWORD_LENGTH } from '@/constants';

export type AuthMode = 'signIn' | 'signUp';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/** Where data and sign-in come from: the AgriEvidence API, or the in-browser offline demo. */
export type AppMode = 'api' | 'demo';

export const RoleSchema = z.enum(['admin', 'viewer']);

export type Role = z.infer<typeof RoleSchema>;

/** The signed-in user, whichever backend signed them in. */
export interface AuthUser {
  uid: string;
  email: string;
  fullName: string;
  role: Role;
}

/** What the auth store needs from an auth backend. */
export interface AuthClient {
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signUp: (credentials: AuthCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  /** Reports the current user, then every change. Returns an unsubscribe function. */
  onAuthStateChanged: (listener: (user: AuthUser | null) => void) => () => void;
}

export interface AuthModeCopy {
  title: string;
  submit: string;
  pending: string;
  switchPrompt: string;
  switchAction: string;
}

const EmailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .pipe(z.email('Enter a valid email address'));

export const SignInSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const SignUpSchema = SignInSchema.extend({
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
});

export type AuthCredentials = z.infer<typeof SignInSchema>;
