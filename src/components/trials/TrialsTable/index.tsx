import { useAtomValue, useSetAtom } from 'jotai';
import { Button, Notice, Spinner } from '@/components/ui';
import { TABLE_COLUMN_LABELS } from '@/constants';
import {
  filteredTrialsAtom,
  loadTrialsAtom,
  settingsAtom,
  trialsAtom,
  trialsStatusAtom,
  useTrialSelection,
} from '@/hooks';
import { cn, customFieldsFor } from '@/utils';
import { TrialRow } from '../TrialRow';
import { TrialsEmptyState } from '../TrialsEmptyState';

export const TrialsTable = () => {
  const trials = useAtomValue(filteredTrialsAtom);
  const hasTrials = useAtomValue(trialsAtom).length > 0;
  const { status, error } = useAtomValue(trialsStatusAtom);
  const settings = useAtomValue(settingsAtom);
  const loadTrials = useSetAtom(loadTrialsAtom);
  const { selectedIds, isFull, toggleSelection } = useTrialSelection();

  const columns = settings.display.table_columns;
  const customColumns = customFieldsFor(settings, 'table');
  const colSpan = columns.length + customColumns.length + 2;
  const isLoading = status === 'loading' || status === 'idle';

  return (
    <div className="flex-1 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
      {status === 'error' && (
        <Notice
          tone="error"
          title="The trials could not be loaded"
          className="m-4"
          actions={
            <Button size="xs" variant="outline" onClick={() => void loadTrials()}>
              Try again
            </Button>
          }
        >
          {error}
        </Notice>
      )}
      {/* While reloading, the previous rows stay visible at reduced opacity instead of flashing. */}
      <div
        className={cn('overflow-x-auto transition-opacity', isLoading && trials.length > 0 && 'opacity-60')}
      >
        <table className="w-full text-left text-sm text-stone-600">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase text-stone-500">
            <tr>
              <th scope="col" className="w-12 p-4 text-center">
                <span className="sr-only">Selected</span>
              </th>
              {columns.map((column) => (
                <th key={column} scope="col" className="p-4 font-semibold whitespace-nowrap">
                  {TABLE_COLUMN_LABELS[column]}
                </th>
              ))}
              {customColumns.map((definition) => (
                <th key={definition.key} scope="col" className="p-4 font-semibold whitespace-nowrap">
                  {definition.label}
                </th>
              ))}
              <th scope="col" className="w-12 p-4">
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {trials.map((trial) => (
              <TrialRow
                key={trial.id}
                trial={trial}
                columns={columns}
                customColumns={customColumns}
                decimals={settings.display.decimals}
                isSelected={selectedIds.includes(trial.id)}
                canSelect={!isFull}
                onToggle={toggleSelection}
              />
            ))}
            {trials.length === 0 && isLoading && (
              <tr>
                <td colSpan={colSpan} className="p-12 text-center">
                  <Spinner label="Loading trials…" />
                </td>
              </tr>
            )}
            {trials.length === 0 && !isLoading && (
              <TrialsEmptyState colSpan={colSpan} hasTrials={hasTrials} />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
