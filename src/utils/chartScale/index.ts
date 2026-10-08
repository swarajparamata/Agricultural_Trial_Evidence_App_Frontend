/** A "nice" tick step (1, 2, 2.5 or 5 × 10ⁿ) that splits `span` into about `targetTicks` parts. */
export const niceStep = (span: number, targetTicks = 4): number => {
  if (!(span > 0)) return 1;
  const raw = span / targetTicks;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const residual = raw / magnitude;
  const nice = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 2.5 ? 2.5 : residual <= 5 ? 5 : 10;
  return nice * magnitude;
};

/** Expands [min, max] outwards to whole tick steps and lists the ticks. */
export const niceDomain = (
  min: number,
  max: number,
  targetTicks = 4,
): { min: number; max: number; ticks: number[] } => {
  let low = min;
  let high = max;
  if (low === high) {
    low -= Math.abs(low) * 0.1 || 1;
    high += Math.abs(high) * 0.1 || 1;
  }
  const step = niceStep(high - low, targetTicks);
  const niceMin = Math.floor(low / step) * step;
  const niceMax = Math.ceil(high / step) * step;
  const ticks: number[] = [];
  for (let tick = niceMin; tick <= niceMax + step / 2; tick += step) ticks.push(Number(tick.toFixed(10)));
  return { min: niceMin, max: niceMax, ticks };
};

export const linearScale =
  (domainMin: number, domainMax: number, rangeMin: number, rangeMax: number) =>
  (value: number): number =>
    domainMax === domainMin
      ? (rangeMin + rangeMax) / 2
      : rangeMin + ((value - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin);

/**
 * Path of a bar with rounded corners at its data end and square corners at the baseline.
 * Vertical bars run from `base` to `end` along y; horizontal ones along x.
 */
export const barPath = (
  orientation: 'vertical' | 'horizontal',
  base: number,
  end: number,
  offset: number,
  thickness: number,
  radius = 4,
): string => {
  const length = Math.abs(end - base);
  if (length < 0.5) return '';
  const r = Math.min(radius, thickness / 2, length);
  const dir = end < base ? -1 : 1;
  if (orientation === 'vertical') {
    const x = offset;
    const w = thickness;
    return [
      `M${x},${base}`,
      `L${x},${end - dir * r}`,
      `Q${x},${end} ${x + r},${end}`,
      `L${x + w - r},${end}`,
      `Q${x + w},${end} ${x + w},${end - dir * r}`,
      `L${x + w},${base}`,
      'Z',
    ].join(' ');
  }
  const y = offset;
  const h = thickness;
  return [
    `M${base},${y}`,
    `L${end - dir * r},${y}`,
    `Q${end},${y} ${end},${y + r}`,
    `L${end},${y + h - r}`,
    `Q${end},${y + h} ${end - dir * r},${y + h}`,
    `L${base},${y + h}`,
    'Z',
  ].join(' ');
};
