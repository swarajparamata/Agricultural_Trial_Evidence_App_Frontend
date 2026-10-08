import { RefreshCw } from 'lucide-react';
import { Button, Card, Notice, Spinner } from '@/components/ui';
import { useAsyncResource } from '@/hooks';
import { api, fmtDateTime } from '@/utils';

const loadAudit = () => api.audit(200);

/** Who changed what: users, trials, conflict decisions, imports and settings. */
export const ActivitySection = () => {
  const { data: events, error, isLoading, reload } = useAsyncResource(loadAudit);

  return (
    <Card
      title="Activity"
      description="The most recent admin actions."
      actions={
        <Button size="sm" variant="outline" onClick={reload} disabled={isLoading}>
          <RefreshCw size={15} aria-hidden="true" /> Refresh
        </Button>
      }
    >
      {error && <Notice tone="error">{error}</Notice>}
      {isLoading && !events && <Spinner label="Loading activity…" />}
      {events && events.length === 0 && <p className="text-sm text-stone-500">Nothing recorded yet.</p>}
      {events && events.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 text-xs text-stone-500 uppercase">
              <tr>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  When
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Who
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  What
                </th>
                <th scope="col" className="py-2 pl-3 font-semibold">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-stone-100 align-top last:border-0">
                  <td className="py-2 pr-3 text-xs whitespace-nowrap text-stone-500">
                    {fmtDateTime(event.at)}
                  </td>
                  <td className="px-3 py-2 text-xs text-stone-700">{event.actor}</td>
                  <td className="px-3 py-2">
                    <code className="rounded-sm bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-700">
                      {event.action}
                    </code>
                    {event.target && (
                      <span className="ml-2 text-xs font-medium text-stone-800">{event.target}</span>
                    )}
                  </td>
                  <td className="py-2 pl-3 text-xs text-stone-600">{event.detail || '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
