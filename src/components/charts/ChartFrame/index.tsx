import { ChartColumn, Table2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn } from '@/utils';

export interface LegendItem {
  label: string;
  color: string;
  shape: 'bar' | 'dot' | 'ring';
}

export interface ChartTable {
  columns: readonly string[];
  rows: readonly (readonly string[])[];
}

interface ChartFrameProps {
  title: string;
  subtitle?: ReactNode;
  /** Shown only for two or more series; a single series is named by the title. */
  legend?: readonly LegendItem[];
  note?: ReactNode;
  /** The chart's accessible twin: every value it plots. */
  table: ChartTable;
  /** Controls placed next to the table toggle (e.g. a grouping select). */
  controls?: ReactNode;
  className?: string;
  children: ReactNode;
}

const LegendSwatch = ({ item }: { item: LegendItem }) => {
  if (item.shape === 'bar')
    return <span className="inline-block size-2.5 rounded-xs" style={{ backgroundColor: item.color }} />;
  if (item.shape === 'ring') {
    return (
      <span
        className="inline-block size-2.5 rounded-full border-2 bg-white"
        style={{ borderColor: item.color }}
      />
    );
  }
  return <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: item.color }} />;
};

/** Card around a chart: title, legend, optional note and a chart/table toggle. */
export const ChartFrame = ({
  title,
  subtitle,
  legend,
  note,
  table,
  controls,
  className,
  children,
}: ChartFrameProps) => {
  const [showTable, setShowTable] = useState(false);

  return (
    <figure className={cn('rounded-xl border border-stone-200 bg-white p-4', className)}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <figcaption className="min-w-0">
          <h3 className="text-sm font-semibold text-stone-800">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-stone-500">{subtitle}</p>}
        </figcaption>
        <div className="flex items-center gap-2">
          {controls}
          <button
            type="button"
            onClick={() => setShowTable((current) => !current)}
            aria-pressed={showTable}
            className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 px-2 py-1 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-emerald-500"
          >
            {showTable ? (
              <ChartColumn size={14} aria-hidden="true" />
            ) : (
              <Table2 size={14} aria-hidden="true" />
            )}
            {showTable ? 'Chart' : 'Table'}
          </button>
        </div>
      </div>

      {legend && legend.length > 1 && !showTable && (
        <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600" aria-label="Legend">
          {legend.map((item) => (
            <li key={item.label} className="flex items-center gap-1.5">
              <LegendSwatch item={item} />
              {item.label}
            </li>
          ))}
        </ul>
      )}

      {showTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 text-stone-500">
              <tr>
                {table.columns.map((column) => (
                  <th key={column} scope="col" className="px-2 py-1.5 font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, index) => (
                <tr key={index} className="border-b border-stone-100 last:border-0">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={cn('px-2 py-1.5 text-stone-700', cellIndex > 0 && 'tabular-nums')}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}

      {note && <p className="mt-2 text-xs leading-relaxed text-stone-500">{note}</p>}
    </figure>
  );
};
