import { Search } from 'lucide-react';

interface TrialsEmptyStateProps {
  /** Number of table columns the message should span. */
  colSpan: number;
  /** False when there are no trials at all (rather than none matching the filters). */
  hasTrials: boolean;
}

export const TrialsEmptyState = ({ colSpan, hasTrials }: TrialsEmptyStateProps) => (
  <tr>
    <td colSpan={colSpan} className="bg-stone-50 p-12 text-center text-stone-500">
      <Search className="mx-auto mb-3 text-stone-300" size={32} aria-hidden="true" />
      {hasTrials ? (
        <>
          <p className="font-medium text-stone-600">No trials found matching current filters.</p>
          <p className="mt-1 text-xs">Try adjusting your filters or clearing them to see more results.</p>
        </>
      ) : (
        <>
          <p className="font-medium text-stone-600">No trials yet.</p>
          <p className="mt-1 text-xs">
            Admins can import CSV files and reports under Settings → Trials &amp; data.
          </p>
        </>
      )}
    </td>
  </tr>
);
