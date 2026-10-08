import { useAuthStore } from '../stores';

/** Admins manage users, trials, imports and settings; viewers browse, compare and ask the assistant. */
export const useIsAdmin = () => useAuthStore((state) => state.user?.role === 'admin');
