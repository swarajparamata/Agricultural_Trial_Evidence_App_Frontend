/**
 * Chart colours, checked with the dataviz palette validator against the white card surface:
 * - blue/red diverging poles (uplift above/below zero): CVD ΔE 21.6, normal-vision ΔE 32.3, both ≥ 3:1;
 * - control → treated is a one-hue ordinal pair (light end 2.11:1), so its values are always labelled;
 * - axis text uses stone-500 (4.8:1) to meet WCAG text contrast.
 */
export const CHART_COLORS = {
  positive: '#2a78d6',
  negative: '#e34948',
  control: '#86b6ef',
  treated: '#1c5cab',
  range: '#52514e',
  grid: '#e7e5e4',
  baseline: '#a8a29e',
  axisText: '#78716c',
} as const;

/** Bars never fill their slot: at most this thick (px). */
export const MAX_BAR_THICKNESS = 24;
