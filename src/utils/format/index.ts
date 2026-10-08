/** Rounded without trailing zeros: 8.0 -> "8", 7.85 -> "7.85", 7800 -> "7,800". */
export const fmtNum = (value: number | null | undefined, decimals = 2): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '–';
  return value.toLocaleString('en-US', { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
};

/** "+5.0%", "-2.5%", "0.0%"; "–" when unknown. */
export const fmtPct = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '–';
  const rounded = Math.round(value * 10) / 10;
  if (rounded === 0) return '0.0%';
  return `${rounded > 0 ? '+' : ''}${rounded.toFixed(1)}%`;
};

export const fmtYield = (value: number | null | undefined, unit: string, decimals = 2): string =>
  value === null || value === undefined ? '–' : `${fmtNum(value, decimals)} ${unit}`;

export const fmtDateTime = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

export const fmtBytes = (bytes: number): string =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/** "1 trial", "3 trials". */
export const plural = (count: number, noun: string, pluralNoun = `${noun}s`): string =>
  `${count} ${count === 1 ? noun : pluralNoun}`;

/** Sorts strings with numbers in natural order ("T2" before "T10"). */
export const naturalCompare = (a: string, b: string): number =>
  a.localeCompare(b, undefined, { numeric: true });
