import { Button, Notice } from '@/components/ui';
import { canSwitchToOfflineDemo, setOfflineDemo } from '@/utils';

interface ApiUnavailableNoticeProps {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}

/** Shown on the login page when the backend can't be reached; offers the offline demo on the dev server. */
export const ApiUnavailableNotice = ({ message, onRetry, isRetrying }: ApiUnavailableNoticeProps) => (
  <Notice
    tone="error"
    title="The AgriEvidence API is not reachable"
    className="mb-6"
    actions={
      <>
        <Button size="xs" variant="outline" onClick={onRetry} disabled={isRetrying}>
          {isRetrying ? 'Retrying…' : 'Try again'}
        </Button>
        {canSwitchToOfflineDemo() && (
          <Button size="xs" variant="outline" onClick={() => setOfflineDemo(true)}>
            Use the offline demo instead
          </Button>
        )}
      </>
    }
  >
    {message} Start it with <code className="font-mono">uvicorn app.main:app</code> in the backend folder.
  </Notice>
);
