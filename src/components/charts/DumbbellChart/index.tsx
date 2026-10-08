import { useState } from 'react';
import { CHART_COLORS } from '@/constants';
import { useElementWidth } from '@/hooks';
import type { DumbbellFacet, DumbbellRow } from '@/types';
import { fmtNum, fmtPct, linearScale, niceDomain } from '@/utils';
import { ChartTooltip, TooltipRow } from '../ChartTooltip';

const ROW_HEIGHT = 40;
const LABEL_WIDTH = 132;
const AXIS_HEIGHT = 26;
const RIGHT_PADDING = 52;
const DOT_RADIUS = 5;

const rowValues = (row: DumbbellRow) =>
  [
    row.control,
    row.treated,
    ...row.controlAlternatives.map((a) => a.value),
    ...row.treatedAlternatives.map((a) => a.value),
  ].filter((value): value is number => value !== null);

const Dot = ({
  cx,
  cy,
  color,
  hollow = false,
}: {
  cx: number;
  cy: number;
  color: string;
  hollow?: boolean;
}) => (
  <circle
    cx={cx}
    cy={cy}
    r={DOT_RADIUS}
    fill={hollow ? '#ffffff' : color}
    stroke={hollow ? color : '#ffffff'}
    strokeWidth={2}
  />
);

const FacetChart = ({ facet }: { facet: DumbbellFacet }) => {
  const [containerRef, width] = useElementWidth();
  const [active, setActive] = useState<number | null>(null);

  const values = facet.rows.flatMap(rowValues);
  const low = Math.min(...values);
  const high = Math.max(...values);
  const pad = (high - low) * 0.15 || Math.abs(high) * 0.05 || 1;
  const domain = niceDomain(low - pad, high + pad, 4);
  const plotLeft = LABEL_WIDTH + 8;
  const x = linearScale(domain.min, domain.max, plotLeft, Math.max(width - RIGHT_PADDING, plotLeft + 40));
  const height = facet.rows.length * ROW_HEIGHT + AXIS_HEIGHT;
  const activeRow = active === null ? null : facet.rows[active];

  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-stone-700">
        {facet.crop} <span className="font-normal text-stone-500">· {facet.unit}</span>
      </p>
      <div ref={containerRef} className="relative" style={{ minHeight: height }}>
        {width > 0 && (
          <svg
            width={width}
            height={height}
            role="group"
            aria-label={`Treated and control yields for ${facet.crop}`}
          >
            {domain.ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={x(tick)}
                  x2={x(tick)}
                  y1={0}
                  y2={height - AXIS_HEIGHT}
                  stroke={CHART_COLORS.grid}
                  shapeRendering="crispEdges"
                />
                <text
                  x={x(tick)}
                  y={height - 8}
                  textAnchor="middle"
                  fill={CHART_COLORS.axisText}
                  className="text-[11px] tabular-nums"
                >
                  {fmtNum(tick)}
                </text>
              </g>
            ))}

            {facet.rows.map((row, index) => {
              const cy = index * ROW_HEIGHT + ROW_HEIGHT / 2;
              const dimmed = active !== null && active !== index;
              const controlX = row.control === null ? null : x(row.control);
              const treatedX = row.treated === null ? null : x(row.treated);
              const same = controlX !== null && treatedX !== null && Math.abs(controlX - treatedX) < 1;
              const treatedRight = controlX === null || treatedX === null || treatedX >= controlX;
              const describe = `${row.id}: control ${row.control === null ? 'missing' : `${fmtNum(row.control)} ${facet.unit}`}, treated ${row.treated === null ? 'missing' : `${fmtNum(row.treated)} ${facet.unit}`}${row.uplift === null ? '' : `, uplift ${fmtPct(row.uplift)}`}`;
              return (
                <g key={row.id} opacity={dimmed ? 0.45 : 1} className="transition-opacity">
                  <text x={0} y={cy - 3} fill="#44403c" className="text-[11px] font-semibold">
                    {row.id}
                  </text>
                  <text x={0} y={cy + 11} fill={CHART_COLORS.axisText} className="text-[10px]">
                    {row.sublabel.length > 24 ? `${row.sublabel.slice(0, 23)}…` : row.sublabel}
                  </text>
                  {controlX !== null && treatedX !== null && !same && (
                    <line
                      x1={controlX}
                      x2={treatedX}
                      y1={cy}
                      y2={cy}
                      stroke={CHART_COLORS.baseline}
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  )}
                  {row.treatedAlternatives.map((alternative) => (
                    <Dot
                      key={`t-${alternative.value}`}
                      cx={x(alternative.value)}
                      cy={cy}
                      color={CHART_COLORS.treated}
                      hollow
                    />
                  ))}
                  {row.controlAlternatives.map((alternative) => (
                    <Dot
                      key={`c-${alternative.value}`}
                      cx={x(alternative.value)}
                      cy={cy}
                      color={CHART_COLORS.control}
                      hollow
                    />
                  ))}
                  {controlX !== null && <Dot cx={controlX} cy={cy} color={CHART_COLORS.control} />}
                  {treatedX !== null && <Dot cx={treatedX} cy={cy} color={CHART_COLORS.treated} />}

                  {same && treatedX !== null && (
                    <text
                      x={treatedX + 10}
                      y={cy}
                      dy="0.32em"
                      fill="#44403c"
                      className="text-[11px] tabular-nums"
                    >
                      {fmtNum(row.treated)} = {fmtNum(row.control)}
                    </text>
                  )}
                  {!same && treatedX !== null && (
                    <text
                      x={treatedRight ? treatedX + 10 : treatedX - 10}
                      y={cy}
                      dy="0.32em"
                      textAnchor={treatedRight ? 'start' : 'end'}
                      fill="#292524"
                      className="text-[11px] font-semibold tabular-nums"
                    >
                      {fmtNum(row.treated)}
                    </text>
                  )}
                  {!same && controlX !== null && (
                    <text
                      x={treatedRight ? controlX - 10 : controlX + 10}
                      y={cy}
                      dy="0.32em"
                      textAnchor={treatedRight ? 'end' : 'start'}
                      fill={CHART_COLORS.axisText}
                      className="text-[11px] tabular-nums"
                    >
                      {fmtNum(row.control)}
                    </text>
                  )}
                  {controlX === null && treatedX !== null && (
                    <text
                      x={treatedX + 34}
                      y={cy}
                      dy="0.32em"
                      fill={CHART_COLORS.axisText}
                      className="text-[10px] italic"
                    >
                      no control yield
                    </text>
                  )}
                  <rect
                    x={0}
                    y={index * ROW_HEIGHT}
                    width={width}
                    height={ROW_HEIGHT}
                    fill="transparent"
                    tabIndex={0}
                    role="img"
                    aria-label={describe}
                    onPointerEnter={() => setActive(index)}
                    onPointerLeave={() => setActive(null)}
                    onFocus={() => setActive(index)}
                    onBlur={() => setActive(null)}
                    className="cursor-default outline-hidden"
                  />
                </g>
              );
            })}
          </svg>
        )}

        {activeRow && (
          <ChartTooltip
            x={activeRow.treated === null ? plotLeft : x(activeRow.treated)}
            y={(active ?? 0) * ROW_HEIGHT + 8}
            containerWidth={width}
          >
            <p className="mb-1 font-semibold text-stone-800">
              {activeRow.id} <span className="font-normal text-stone-500">· {activeRow.sublabel}</span>
            </p>
            <TooltipRow
              color={CHART_COLORS.treated}
              value={activeRow.treated === null ? 'missing' : `${fmtNum(activeRow.treated)} ${facet.unit}`}
              label="treated"
            />
            <TooltipRow
              color={CHART_COLORS.control}
              value={activeRow.control === null ? 'missing' : `${fmtNum(activeRow.control)} ${facet.unit}`}
              label="control"
            />
            {activeRow.uplift !== null && <TooltipRow value={fmtPct(activeRow.uplift)} label="uplift" />}
            {[...activeRow.treatedAlternatives, ...activeRow.controlAlternatives].map((alternative) => (
              <p key={alternative.value} className="mt-1">
                Other source: {fmtNum(alternative.value)} {facet.unit} ({alternative.sources.join(', ')})
              </p>
            ))}
          </ChartTooltip>
        )}
      </div>
    </div>
  );
};

interface DumbbellChartProps {
  facets: readonly DumbbellFacet[];
}

/** Control → treated yield per trial. Each crop gets its own axis because their yields differ ~5×. */
export const DumbbellChart = ({ facets }: DumbbellChartProps) => (
  <div className="space-y-4">
    {facets.map((facet) => (
      <FacetChart key={facet.crop} facet={facet} />
    ))}
  </div>
);
