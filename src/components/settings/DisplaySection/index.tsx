import { useAtomValue } from 'jotai';
import { useId } from 'react';
import { Card, FormField, Select, TextInput, Toggle } from '@/components/ui';
import { COMPARE_FIELD_LABELS, TABLE_COLUMN_LABELS } from '@/constants';
import { settingsAtom, useSettingsSection } from '@/hooks';
import { COMPARE_FIELD_KEYS, TABLE_COLUMN_KEYS } from '@/types';
import { unitNames } from '@/utils';
import { ColumnPicker } from '../ColumnPicker';
import { SaveBar } from '../SaveBar';

const DisplayCard = () => {
  const ids = useId();
  const section = useSettingsSection('display');
  const units = unitNames(useAtomValue(settingsAtom));
  const display = section.draft;

  return (
    <Card
      title="Display"
      description="Branding, the unit yields are shown in, and the trial table's columns."
      footer={
        <SaveBar
          isDirty={section.isDirty}
          isSaving={section.isSaving}
          error={section.error}
          message={section.message}
          onSave={() => void section.save()}
          onDiscard={section.discard}
          onReset={() => void section.resetToDefaults()}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id={`${ids}-name`} label="App name">
          <TextInput
            id={`${ids}-name`}
            value={display.app_name}
            maxLength={60}
            onChange={(event) => section.update({ app_name: event.target.value })}
          />
        </FormField>
        <FormField id={`${ids}-org`} label="Organization" hint="Shown under the app name.">
          <TextInput
            id={`${ids}-org`}
            value={display.organization}
            maxLength={120}
            onChange={(event) => section.update({ organization: event.target.value })}
          />
        </FormField>
        <FormField id={`${ids}-unit`} label="Show yields in" hint="All yields are converted to this unit.">
          <Select
            id={`${ids}-unit`}
            value={display.yield_unit}
            options={units}
            onChange={(event) => section.update({ yield_unit: event.target.value })}
          />
        </FormField>
        <FormField id={`${ids}-decimals`} label="Decimal places">
          <Select
            id={`${ids}-decimals`}
            value={String(display.decimals)}
            options={['0', '1', '2', '3', '4']}
            onChange={(event) => section.update({ decimals: Number(event.target.value) })}
          />
        </FormField>
      </div>
      <h3 className="mt-6 mb-2 text-sm font-semibold text-stone-800">Trial table columns</h3>
      <p className="mb-2 text-xs text-stone-500">
        Custom fields get their own columns when “Show as a table column” is on.
      </p>
      <ColumnPicker
        all={TABLE_COLUMN_KEYS}
        selected={display.table_columns}
        labels={TABLE_COLUMN_LABELS}
        locked={['id']}
        onChange={(table_columns) => section.update({ table_columns })}
      />
    </Card>
  );
};

const ComparisonCard = () => {
  const ids = useId();
  const section = useSettingsSection('comparison');
  const comparison = section.draft;

  return (
    <Card
      title="Comparison & charts"
      description="What the compare view shows for the selected trials."
      footer={
        <SaveBar
          isDirty={section.isDirty}
          isSaving={section.isSaving}
          error={section.error}
          message={section.message}
          onSave={() => void section.save()}
          onDiscard={section.discard}
          onReset={() => void section.resetToDefaults()}
        />
      }
    >
      <FormField id={`${ids}-max`} label="Trials per comparison" className="mb-4 max-w-56">
        <Select
          id={`${ids}-max`}
          value={String(comparison.max_trials)}
          options={['2', '3', '4', '5', '6', '8', '10', '12']}
          onChange={(event) => section.update({ max_trials: Number(event.target.value) })}
        />
      </FormField>
      <div className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
        <Toggle
          label="Uplift chart"
          description="Uplift % per trial with the range conflicting sources allow."
          checked={comparison.show_uplift_chart}
          onChange={(show_uplift_chart) => section.update({ show_uplift_chart })}
        />
        <Toggle
          label="Treated vs control chart"
          description="Both yields per trial, one axis per crop."
          checked={comparison.show_yield_chart}
          onChange={(show_yield_chart) => section.update({ show_yield_chart })}
        />
        <Toggle
          label="Difference chart"
          description="Treated minus control in the yield unit."
          checked={comparison.show_difference_chart}
          onChange={(show_difference_chart) => section.update({ show_difference_chart })}
        />
        <Toggle
          label="Custom field charts"
          description="A chart for every number field marked “chart it”."
          checked={comparison.show_custom_charts}
          onChange={(show_custom_charts) => section.update({ show_custom_charts })}
        />
        <Toggle
          label="Highlight differences"
          description="Shade rows whose values differ between the trials."
          checked={comparison.highlight_differences}
          onChange={(highlight_differences) => section.update({ highlight_differences })}
        />
      </div>
      <h3 className="mt-6 mb-2 text-sm font-semibold text-stone-800">Comparison table rows</h3>
      <ColumnPicker
        all={COMPARE_FIELD_KEYS}
        selected={comparison.fields}
        labels={COMPARE_FIELD_LABELS}
        onChange={(fields) => section.update({ fields })}
      />
    </Card>
  );
};

export const DisplaySection = () => (
  <>
    <DisplayCard />
    <ComparisonCard />
  </>
);
