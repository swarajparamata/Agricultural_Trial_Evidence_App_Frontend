import { useAtomValue, useSetAtom } from 'jotai';
import { GitCompare, Plus, RefreshCw } from 'lucide-react';
import { Button, IconButton } from '@/components/ui';
import {
  filteredTrialsAtom,
  isCompareModalOpenAtom,
  loadTrialsAtom,
  trialFormAtom,
  trialsAtom,
  trialsStatusAtom,
  useDisclosure,
  useIsAdmin,
  useTrialSelection,
} from '@/hooks';
import { cn, getAppMode } from '@/utils';

export const TrialToolbar = () => {
  const { selectedCount, maxSelection, isFull, clearSelection } = useTrialSelection();
  const shown = useAtomValue(filteredTrialsAtom).length;
  const total = useAtomValue(trialsAtom).length;
  const { status } = useAtomValue(trialsStatusAtom);
  const loadTrials = useSetAtom(loadTrialsAtom);
  const setTrialForm = useSetAtom(trialFormAtom);
  const compareModal = useDisclosure(isCompareModalOpenAtom);
  const isAdmin = useIsAdmin();

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-stone-600" aria-live="polite">
        Showing <span className="font-semibold text-stone-800">{shown}</span> of {total} trials
        {selectedCount > 0 && (
          <>
            {' · '}
            <span className="font-semibold text-stone-800">{selectedCount}</span> selected
            {isFull && <span className="text-stone-500"> (comparison limit {maxSelection})</span>}
          </>
        )}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        {getAppMode() === 'api' && (
          <IconButton
            icon={RefreshCw}
            label="Reload trials"
            onClick={() => void loadTrials()}
            disabled={status === 'loading'}
            className={cn(status === 'loading' && '[&>svg]:animate-spin')}
          />
        )}
        {selectedCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            Clear selection
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={compareModal.open}
          disabled={selectedCount < 2}
          title={selectedCount < 2 ? 'Select at least two trials to compare' : undefined}
        >
          <GitCompare size={18} aria-hidden="true" />
          Compare Selected ({selectedCount})
        </Button>
        {isAdmin && (
          <Button variant="dark" size="lg" onClick={() => setTrialForm({ mode: 'create' })}>
            <Plus size={18} aria-hidden="true" />
            Add New Trial
          </Button>
        )}
      </div>
    </div>
  );
};
