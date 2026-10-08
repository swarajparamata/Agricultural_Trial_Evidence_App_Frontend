import type { ReactNode } from 'react';

interface ChartTooltipProps {
  /** Anchor point in px inside the chart container (the top centre of the mark). */
  x: number;
  y: number;
  containerWidth: number;
  children: ReactNode;
}

const HALF_WIDTH = 96;

/** Floating readout above a hovered or focused mark; it only repeats values the table view also shows. */
export const ChartTooltip = ({ x, y, containerWidth, children }: ChartTooltipProps) => (
  <div
    role="tooltip"
    className="pointer-events-none absolute z-10 w-max max-w-56 -translate-x-1/2 -translate-y-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-600 shadow-lg"
    style={{
      left: Math.min(Math.max(x, HALF_WIDTH), Math.max(containerWidth - HALF_WIDTH, HALF_WIDTH)),
      top: y - 8,
    }}
  >
    {children}
  </div>
);

/** A tooltip row: a short line key in the series colour, the value (strong) and its name. */
export const TooltipRow = ({ color, value, label }: { color?: string; value: string; label: string }) => (
  <div className="flex items-center gap-2 whitespace-nowrap">
    {color && (
      <span
        className="inline-block h-0.5 w-3 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
    )}
    <span className="font-semibold text-stone-900 tabular-nums">{value}</span>
    <span>{label}</span>
  </div>
);
