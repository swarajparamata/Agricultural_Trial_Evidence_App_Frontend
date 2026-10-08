import { Funnel } from 'lucide-react';
import { Button } from '@/components/ui';
import { useTrialFilters } from '@/hooks';
import { filterOptionLabel } from '@/utils';
import { FilterSelect } from '../FilterSelect';

/** One row of filters above everything they scope: the insights, the table and the comparison. */
export const FilterPanel = () => {
  const { fields, filters, options, activeCount, setFilter, resetFilters } = useTrialFilters();

  return (
    <section
      aria-label="Filter trials"
      className="flex flex-wrap items-end gap-4 rounded-xl border border-stone-200 bg-white p-5 shadow-xs"
    >
      <h2 className="mb-2 flex w-full items-center gap-2 border-b border-stone-100 pb-2 text-lg font-semibold text-stone-800">
        <Funnel size={20} className="text-emerald-600" aria-hidden="true" /> Filter Trials
        {activeCount > 0 && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
            {activeCount} active
          </span>
        )}
      </h2>

      {fields.map(({ key, label, allLabel }) => (
        <FilterSelect
          key={key}
          label={label}
          allLabel={allLabel}
          value={filters[key] ?? ''}
          options={(options[key] ?? []).map((value) => ({ value, label: filterOptionLabel(key, value) }))}
          onChange={(value) => setFilter(key, value)}
        />
      ))}

      <Button
        variant="subtle"
        onClick={() => resetFilters()}
        disabled={activeCount === 0}
        className="ml-auto"
      >
        Reset Filters
      </Button>
    </section>
  );
};
