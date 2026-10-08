import { FlaskConical } from 'lucide-react';

/** Explains the offline demo login, used when the app runs without the backend. */
export const DemoAuthNotice = () => (
  <div
    role="note"
    className="mb-6 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
  >
    <FlaskConical size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
    <p>
      <span className="font-semibold">Offline demo.</span> No backend is connected, so any email and password
      signs you in on this device with the sample trials. Emails starting with{' '}
      <code className="rounded-sm bg-amber-100 px-1 font-mono">admin</code> get the admin role. Set{' '}
      <code className="rounded-sm bg-amber-100 px-1 font-mono">VITE_API_BASE_URL</code> in{' '}
      <code className="rounded-sm bg-amber-100 px-1 font-mono">.env</code> to use the API.
    </p>
  </div>
);
