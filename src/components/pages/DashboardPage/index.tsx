import { FilterPanel, InsightsPanel, TrialToolbar, TrialsTable } from '@/components/trials';

/** Filters first: they scope the insights, the table and the comparison below them. */
export const DashboardPage = () => (
  <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6">
    <FilterPanel />
    <InsightsPanel />
    <TrialToolbar />
    <TrialsTable />
  </main>
);
