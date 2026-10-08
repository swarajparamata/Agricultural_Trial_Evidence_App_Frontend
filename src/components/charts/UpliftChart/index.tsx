import { useState } from 'react';
import { CHART_COLORS, MAX_BAR_THICKNESS } from '@/constants';
import { useElementWidth } from '@/hooks';
import type { UpliftDatum } from '@/types';
import { barPath, fmtPct, linearScale, niceDomain } from '@/utils';
import { ChartTooltip, TooltipRow } from '../ChartTooltip';

const HEIGHT = 240;
const MARGIN = { top: 28, right: 12, bottom: 36, left: 48 };

const tickLabel = (value: number) => `${Number(value.toFixed(1))}%`;

interface UpliftChartProps {
  data: readonly UpliftDatum[];
}

/**
 * Uplift % per trial as columns from a zero baseline: blue above, red below (diverging poles).
 * A whisker marks the range the conflicting source values allow; trials without uplift say why.
 */
export const UpliftChart = ({ data }: UpliftChartProps) => {
  const [containerRef, width] = useElementWidth();
  const [active, setActive] = useState<number | null>(null);

  const values = data
    .flatMap((datum) => [datum.value, ...(datum.range ?? [])])
    .filter((value): value is number => value !== null);
  const domain = niceDomain(Math.min(0, ...values), Math.max(0, ...values, 1), 4);
  const y = linearScale(domain.min, domain.max, HEIGHT - MARGIN.bottom, MARGIN.top);
  const band = (width - MARGIN.left - MARGIN.right) / Math.max(data.length, 1);
  const thickness = Math.min(MAX_BAR_THICKNESS, band * 0.45);
  const base = y(0);

  const activeDatum = active === null ? null : data[active];
  const anchorX = active === null ? 0 : MARGIN.left + band * active + band / 2;
  const anchorY = activeDatum
    ? Math.min(base, y(Math.max(activeDatum.value ?? 0, activeDatum.range?.[1] ?? Number.NEGATIVE_INFINITY)))
    : 0;

  return (
    <div ref={containerRef} className="relative min-h-60">
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          role="group"
          aria-label="Yield uplift per trial"
          className="overflow-visible"
        >
          {domain.ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={MARGIN.left}
                x2={width - MARGIN.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke={tick === 0 ? CHART_COLORS.baseline : CHART_COLORS.grid}
                strokeWidth={1}
                shapeRendering="crispEdges"
              />
              <text
                x={MARGIN.left - 8}
                y={y(tick)}
                dy="0.32em"
                textAnchor="end"
                fill={CHART_COLORS.axisText}
                className="text-[11px] tabular-nums"
              >
                {tickLabel(tick)}
              </text>
            </g>
          ))}

          {data.map((datum, index) => {
            const center = MARGIN.left + band * index + band / 2;
            const dimmed = active !== null && active !== index;
            const end = datum.value === null ? base : y(datum.value);
            const top = datum.range ? Math.min(end, y(datum.range[1])) : end;
            const bottom = datum.range ? Math.max(end, y(datum.range[0])) : end;
            const negative = (datum.value ?? 0) < 0;
            const label =
              datum.value === null ? `n/a – ${datum.missingReason ?? 'no uplift'}` : fmtPct(datum.value);
            // With a whisker the label sits beside the bar end, so it isn't read as the whisker's top value.
            const besideBar = datum.range !== null && datum.value !== null;
            const labelX = besideBar ? center + thickness / 2 + 6 : center;
            const labelY = besideBar
              ? end + (negative ? 10 : 4)
              : negative
                ? bottom + 14
                : Math.min(top, base) - 6;
            return (
              <g key={datum.id} opacity={dimmed ? 0.45 : 1} className="transition-opacity">
                {datum.value !== null && (
                  <path
                    d={barPath('vertical', base, end, center - thickness / 2, thickness)}
                    fill={negative ? CHART_COLORS.negative : CHART_COLORS.positive}
                  />
                )}
                {datum.range && (
                  <g stroke={CHART_COLORS.range} strokeWidth={1.5}>
                    <line x1={center} x2={center} y1={y(datum.range[0])} y2={y(datum.range[1])} />
                    <line x1={center - 5} x2={center + 5} y1={y(datum.range[0])} y2={y(datum.range[0])} />
                    <line x1={center - 5} x2={center + 5} y1={y(datum.range[1])} y2={y(datum.range[1])} />
                  </g>
                )}
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor={besideBar ? 'start' : 'middle'}
                  fill={datum.value === null ? CHART_COLORS.axisText : '#44403c'}
                  className={
                    datum.value === null ? 'text-[10px] italic' : 'text-[11px] font-semibold tabular-nums'
                  }
                >
                  {datum.value === null ? 'n/a' : label}
                </text>
                <text
                  x={center}
                  y={HEIGHT - MARGIN.bottom + 18}
                  textAnchor="middle"
                  fill="#44403c"
                  className="text-[11px] font-semibold"
                >
                  {datum.id}
                </text>
                <rect
                  x={MARGIN.left + band * index}
                  y={MARGIN.top - 12}
                  width={band}
                  height={HEIGHT - MARGIN.top - MARGIN.bottom + 36}
                  fill="transparent"
                  tabIndex={0}
                  role="img"
                  aria-label={`${datum.id}, ${datum.sublabel}: uplift ${label}${datum.range ? `, ${fmtPct(datum.range[0])} to ${fmtPct(datum.range[1])} given conflicting sources` : ''}`}
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

      {activeDatum && (
        <ChartTooltip x={anchorX} y={anchorY} containerWidth={width}>
          <p className="mb-1 font-semibold text-stone-800">
            {activeDatum.id} <span className="font-normal text-stone-500">· {activeDatum.sublabel}</span>
          </p>
          {activeDatum.value === null ? (
            <p>No uplift: {activeDatum.missingReason}.</p>
          ) : (
            <TooltipRow
              color={activeDatum.value < 0 ? CHART_COLORS.negative : CHART_COLORS.positive}
              value={fmtPct(activeDatum.value)}
              label="uplift vs control"
            />
          )}
          {activeDatum.range && (
            <p className="mt-1">
              Sources conflict: {fmtPct(activeDatum.range[0])} to {fmtPct(activeDatum.range[1])}
            </p>
          )}
        </ChartTooltip>
      )}
    </div>
  );
};
