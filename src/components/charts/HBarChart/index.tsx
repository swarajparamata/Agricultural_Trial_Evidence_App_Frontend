import { useState } from 'react';
import { CHART_COLORS } from '@/constants';
import { useElementWidth } from '@/hooks';
import type { BarDatum } from '@/types';
import { barPath, linearScale, niceDomain } from '@/utils';
import { ChartTooltip, TooltipRow } from '../ChartTooltip';

const ROW_HEIGHT = 34;
const THICKNESS = 16;
const AXIS_HEIGHT = 24;
const VALUE_ROOM = 56;

interface HBarChartProps {
  data: readonly BarDatum[];
  formatValue: (value: number) => string;
  formatTick?: (value: number) => string;
  /** Colour negative bars red (for values with a meaningful sign, such as uplift). */
  polarity?: boolean;
  ariaLabel: string;
  labelWidth?: number;
  /** What a value means, shown in the tooltip ("mean uplift"). */
  valueLabel: string;
}

/** Single-series horizontal bars from a zero baseline, value at each bar tip. */
export const HBarChart = ({
  data,
  formatValue,
  formatTick = formatValue,
  polarity = false,
  ariaLabel,
  labelWidth = 112,
  valueLabel,
}: HBarChartProps) => {
  const [containerRef, width] = useElementWidth();
  const [active, setActive] = useState<number | null>(null);

  const values = data.flatMap((datum) => (datum.value === null ? [] : [datum.value]));
  const domain = niceDomain(Math.min(0, ...values), Math.max(0, ...values, 0.0001), 4);
  const plotLeft = labelWidth + (domain.min < 0 ? VALUE_ROOM : 8);
  const x = linearScale(domain.min, domain.max, plotLeft, Math.max(width - VALUE_ROOM, plotLeft + 40));
  const height = data.length * ROW_HEIGHT + AXIS_HEIGHT;
  const base = x(0);
  const activeDatum = active === null ? null : data[active];

  return (
    <div ref={containerRef} className="relative" style={{ minHeight: height }}>
      {width > 0 && (
        <svg width={width} height={height} role="group" aria-label={ariaLabel}>
          {domain.ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={x(tick)}
                x2={x(tick)}
                y1={0}
                y2={height - AXIS_HEIGHT}
                stroke={tick === 0 ? CHART_COLORS.baseline : CHART_COLORS.grid}
                shapeRendering="crispEdges"
              />
              <text
                x={x(tick)}
                y={height - 7}
                textAnchor="middle"
                fill={CHART_COLORS.axisText}
                className="text-[11px] tabular-nums"
              >
                {formatTick(tick)}
              </text>
            </g>
          ))}

          {data.map((datum, index) => {
            const top = index * ROW_HEIGHT + (ROW_HEIGHT - THICKNESS) / 2;
            const cy = index * ROW_HEIGHT + ROW_HEIGHT / 2;
            const negative = (datum.value ?? 0) < 0;
            const end = datum.value === null ? base : x(datum.value);
            const dimmed = active !== null && active !== index;
            return (
              <g key={datum.label} opacity={dimmed ? 0.45 : 1} className="transition-opacity">
                <text x={0} y={cy} dy="0.32em" fill="#44403c" className="text-[11px] font-medium">
                  {datum.label.length > 18 ? `${datum.label.slice(0, 17)}…` : datum.label}
                </text>
                {datum.value !== null && (
                  <path
                    d={barPath('horizontal', base, end, top, THICKNESS)}
                    fill={polarity && negative ? CHART_COLORS.negative : CHART_COLORS.positive}
                  />
                )}
                <text
                  x={datum.value === null ? base + 6 : negative ? end - 6 : end + 6}
                  y={cy}
                  dy="0.32em"
                  textAnchor={negative ? 'end' : 'start'}
                  fill={datum.value === null ? CHART_COLORS.axisText : '#292524'}
                  className={
                    datum.value === null ? 'text-[10px] italic' : 'text-[11px] font-semibold tabular-nums'
                  }
                >
                  {datum.value === null ? 'no data' : formatValue(datum.value)}
                </text>
                <rect
                  x={0}
                  y={index * ROW_HEIGHT}
                  width={width}
                  height={ROW_HEIGHT}
                  fill="transparent"
                  tabIndex={0}
                  role="img"
                  aria-label={`${datum.label}: ${datum.value === null ? 'no data' : formatValue(datum.value)}${datum.detail ? ` (${datum.detail})` : ''}`}
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
        <ChartTooltip
          x={activeDatum.value === null ? base : x(activeDatum.value)}
          y={(active ?? 0) * ROW_HEIGHT + 6}
          containerWidth={width}
        >
          <p className="mb-1 font-semibold text-stone-800">{activeDatum.label}</p>
          <TooltipRow
            color={polarity && (activeDatum.value ?? 0) < 0 ? CHART_COLORS.negative : CHART_COLORS.positive}
            value={activeDatum.value === null ? 'no data' : formatValue(activeDatum.value)}
            label={valueLabel}
          />
          {activeDatum.detail && <p className="mt-1">{activeDatum.detail}</p>}
        </ChartTooltip>
      )}
    </div>
  );
};
