import { TriangleAlert } from 'lucide-react';
import { BrandLogo } from '@/components/ui';

interface ConfigErrorPageProps {
  issues: readonly string[];
}

/** Shown instead of the app when the configuration is invalid, e.g. a production build without an API URL. */
export const ConfigErrorPage = ({ issues }: ConfigErrorPageProps) => (
  <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
    <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-8 shadow-xl">
      <BrandLogo className="mb-6" />
      <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        <p className="flex items-center gap-2 font-semibold">
          <TriangleAlert size={16} aria-hidden="true" /> The app configuration is incomplete
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 font-mono text-xs">
          {issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        Add the missing values to <code className="rounded-sm bg-stone-100 px-1 font-mono">.env</code> (see{' '}
        <code className="rounded-sm bg-stone-100 px-1 font-mono">.env.example</code>), then restart the dev
        server or rebuild. <code className="rounded-sm bg-stone-100 px-1 font-mono">VITE_API_BASE_URL</code>{' '}
        is the address of the AgriEvidence API, e.g.{' '}
        <code className="rounded-sm bg-stone-100 px-1 font-mono">http://127.0.0.1:8000</code>.
      </p>
    </div>
  </div>
);
