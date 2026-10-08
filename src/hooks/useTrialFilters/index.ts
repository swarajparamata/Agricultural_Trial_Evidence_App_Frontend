import { useAtomValue, useSetAtom } from 'jotai';
import {
  activeFilterCountAtom,
  filterFieldsAtom,
  filterOptionsAtom,
  resetTrialFiltersAtom,
  setTrialFilterAtom,
  trialFiltersAtom,
} from '../atoms';

export const useTrialFilters = () => {
  const fields = useAtomValue(filterFieldsAtom);
  const filters = useAtomValue(trialFiltersAtom);
  const options = useAtomValue(filterOptionsAtom);
  const activeCount = useAtomValue(activeFilterCountAtom);
  const setFilter = useSetAtom(setTrialFilterAtom);
  const resetFilters = useSetAtom(resetTrialFiltersAtom);

  return { fields, filters, options, activeCount, setFilter, resetFilters };
};
