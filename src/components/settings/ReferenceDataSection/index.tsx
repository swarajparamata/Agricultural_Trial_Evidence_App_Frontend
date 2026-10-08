import { Card, Select, TextInput, Toggle } from '@/components/ui';
import { BADGE_COLOR_CLASSES, BADGE_COLORS } from '@/constants';
import { useSettingsSection } from '@/hooks';
import type { BadgeColor } from '@/types';
import { cn } from '@/utils';
import { SaveBar } from '../SaveBar';
import { UnitsEditor } from '../UnitsEditor';
import { VocabularyEditor } from '../VocabularyEditor';

/** Canonical vocabularies: how spellings in source files are merged ("HARVESTPLUS" = "Harvest Plus"). */
export const ReferenceDataSection = () => {
  const section = useSettingsSection('reference_data');
  const data = section.draft;

  return (
    <Card
      title="Reference data"
      description="Canonical names and the spellings that mean the same thing. Imports, filters and the assistant use them to merge values such as HarvestPlus, HARVESTPLUS and Harvest Plus. Matching ignores case, spaces and punctuation; plural forms are also recognised. Saving re-reads every imported file."
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
      bodyClassName="space-y-6"
    >
      <Toggle
        label="Strict vocabulary for manual entries"
        description="When on, admins can only add trials with known crops, products, countries and trial types. Imports still accept new values (and flag them)."
        checked={data.strict_vocabulary}
        onChange={(strict_vocabulary) => section.update({ strict_vocabulary })}
      />
      <VocabularyEditor
        title="Crops"
        noun="crop"
        entries={data.crops}
        onChange={(crops) => section.update({ crops })}
        makeEntry={() => ({ name: '', aliases: [] })}
      />
      <VocabularyEditor
        title="Products"
        noun="product"
        entries={data.products}
        onChange={(products) => section.update({ products })}
        makeEntry={() => ({ name: '', aliases: [] })}
      />
      <VocabularyEditor
        title="Countries"
        description="The ISO code is matched too (FR = France)."
        noun="country"
        entries={data.countries}
        onChange={(countries) => section.update({ countries })}
        makeEntry={() => ({ name: '', aliases: [], code: null })}
        renderExtra={(entry, update) => (
          <TextInput
            aria-label={`ISO code of ${entry.name || 'the country'}`}
            value={entry.code ?? ''}
            maxLength={3}
            placeholder="ISO code, e.g. FR"
            onChange={(event) => update({ code: event.target.value.toUpperCase() || null })}
            className="w-40 font-mono uppercase"
          />
        )}
      />
      <VocabularyEditor
        title="Trial types"
        description="The colour is used for the type badge; the description appears as its tooltip."
        noun="trial type"
        entries={data.trial_types}
        onChange={(trial_types) => section.update({ trial_types })}
        makeEntry={() => ({ name: '', aliases: [], color: 'stone' as const, description: '' })}
        renderExtra={(entry, update) => (
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn('inline-block size-3 rounded-full', BADGE_COLOR_CLASSES[entry.color].swatch)}
              aria-hidden="true"
            />
            <Select
              aria-label={`Badge colour of ${entry.name || 'the trial type'}`}
              value={entry.color}
              options={BADGE_COLORS}
              onChange={(event) => update({ color: event.target.value as BadgeColor })}
              className="w-28 py-1.5"
            />
            <TextInput
              aria-label={`Description of ${entry.name || 'the trial type'}`}
              value={entry.description}
              placeholder="What this type of trial means for the evidence"
              onChange={(event) => update({ description: event.target.value })}
              className="min-w-56 flex-1 py-1.5"
            />
          </div>
        )}
      />
      <UnitsEditor units={data.units} onChange={(units) => section.update({ units })} />
    </Card>
  );
};
