import { FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui';
import { canSwitchToOfflineDemo, getAppMode, setOfflineDemo } from '@/utils';

/** Reminds everyone that the offline demo keeps its data in this browser only. */
export const ModeBanner = () => {
  if (getAppMode() !== 'demo') return null;

  return (
    <div
      role="note"
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-50 px-4 py-2 text-sm text-amber-900"
    >
      <FlaskConical size={16} aria-hidden="true" />
      <span>
        <span className="font-semibold">Offline demo:</span> the sample trials live in this browser. The
        assistant, imports, users and settings need the backend.
      </span>
      {canSwitchToOfflineDemo() && (
        <Button variant="link" size="none" className="text-amber-900" onClick={() => setOfflineDemo(false)}>
          Connect to the backend
        </Button>
      )}
    </div>
  );
};
