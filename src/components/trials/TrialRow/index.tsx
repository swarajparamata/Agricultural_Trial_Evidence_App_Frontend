import { useSetAtom } from 'jotai';
import { CircleAlert, Eye, FileText, PenLine } from 'lucide-react';
import { IconButton, SelectionCheckbox } from '@/components/ui';
import { detailTrialIdAtom, sourceFileAtom } from '@/hooks';
import type { CustomFieldDefinition, TableColumnKey, Trial } from '@/types';
import { cn, fmtNum, formatCustomValue, getAppMode, openConflicts, sourceFiles } from '@/utils';
import { StatusBadge } from '../StatusBadge';
import { TrialTypeBadge } from '../TrialTypeBadge';
import { UpliftValue } from '../UpliftValue';

const YIELD_COLUMNS = new Set<TableColumnKey>(['treatment_yield', 'control_yield', 'yield_difference']);

interface TrialRowProps {
  trial: Trial;
  columns: readonly TableColumnKey[];
  customColumns: readonly CustomFieldDefinition[];
  decimals: number;
  isSelected: boolean;
  canSelect: boolean;
  onToggle: (id: string) => void;
}

const YieldCell = ({
  trial,
  column,
  decimals,
}: {
  trial: Trial;
  column: TableColumnKey;
  decimals: number;
}) => {
  const value = trial[column as 'treatment_yield' | 'control_yield' | 'yield_difference'];
  const conflict = openConflicts(trial).find((item) => item.field === column);
  return (
    <td className="p-4 font-mono font-medium whitespace-nowrap text-stone-800">
      {value === null ? (
        <span className="text-stone-400" title="Not reported by any source">
          –
        </span>
      ) : (
        <>
          {fmtNum(value, decimals)} <span className="text-xs text-stone-400">{trial.yield_unit}</span>
        </>
      )}
      {conflict && (
        <span
          title={`Sources disagree: ${conflict.candidates.map((c) => `${c.display} (${c.sources.join(', ')})`).join(' vs ')}`}
        >
          <CircleAlert
            size={13}
            className="ml-1 inline align-[-2px] text-red-600"
            aria-label="Sources disagree"
          />
        </span>
      )}
    </td>
  );
};

const SourcesCell = ({ trial }: { trial: Trial }) => {
  const openSource = useSetAtom(sourceFileAtom);
  const canOpen = getAppMode() === 'api';
  return (
    <td className="p-4">
      <ul className="space-y-0.5">
        {sourceFiles(trial).map((file) => (
          <li key={file} className="flex items-center gap-1.5 text-xs text-stone-500">
            <FileText size={13} className="shrink-0 text-emerald-600/60" aria-hidden="true" />
            {canOpen && file !== 'Manual entry' ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  openSource(file);
                }}
                className="truncate text-left hover:text-emerald-700 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-500"
              >
                {file}
              </button>
            ) : (
              <span className="truncate">{file}</span>
            )}
          </li>
        ))}
      </ul>
    </td>
  );
};

const CoreCell = ({
  trial,
  column,
  decimals,
}: {
  trial: Trial;
  column: TableColumnKey;
  decimals: number;
}) => {
  if (YIELD_COLUMNS.has(column)) return <YieldCell trial={trial} column={column} decimals={decimals} />;
  switch (column) {
    case 'id':
      return (
        <td className="p-4 font-medium text-stone-900">
          <span className="flex items-center gap-1.5">
            {trial.id}
            {trial.overridden_fields.length > 0 && (
              <span title={`Edited by an admin: ${trial.overridden_fields.join(', ')}`}>
                <PenLine size={12} className="text-violet-600" aria-label="Edited by an admin" />
              </span>
            )}
          </span>
        </td>
      );
    case 'product':
      return <td className="p-4 font-semibold whitespace-nowrap text-emerald-800">{trial.product ?? '–'}</td>;
    case 'trial_type':
      return (
        <td className="p-4">
          <TrialTypeBadge type={trial.trial_type} />
        </td>
      );
    case 'uplift_pct':
      return (
        <td className="p-4">
          <UpliftValue trial={trial} />
        </td>
      );
    case 'status':
      return (
        <td className="p-4">
          <StatusBadge status={trial.status} />
        </td>
      );
    case 'sources':
      return <SourcesCell trial={trial} />;
    default:
      return <td className="p-4">{trial[column] ?? '–'}</td>;
  }
};

export const TrialRow = ({
  trial,
  columns,
  customColumns,
  decimals,
  isSelected,
  canSelect,
  onToggle,
}: TrialRowProps) => {
  const openDetails = useSetAtom(detailTrialIdAtom);
  const toggle = () => {
    if (isSelected || canSelect) onToggle(trial.id);
  };

  return (
    <tr
      onClick={toggle}
      className={cn(
        'cursor-pointer border-b border-stone-100 transition-colors hover:bg-emerald-50/60',
        isSelected && 'bg-emerald-50/40',
      )}
    >
      <td className="p-4 text-center">
        <SelectionCheckbox checked={isSelected} onToggle={toggle} label={`Select trial ${trial.id}`} />
      </td>
      {columns.map((column) => (
        <CoreCell key={column} trial={trial} column={column} decimals={decimals} />
      ))}
      {customColumns.map((definition) => (
        <td key={definition.key} className="p-4 whitespace-nowrap">
          {formatCustomValue(definition, trial.custom_fields[definition.key], decimals)}
        </td>
      ))}
      <td className="p-2 text-right">
        <IconButton
          icon={Eye}
          label={`View details of ${trial.id}`}
          iconSize={18}
          onClick={(event) => {
            event.stopPropagation();
            openDetails(trial.id);
          }}
        />
      </td>
    </tr>
  );
};
