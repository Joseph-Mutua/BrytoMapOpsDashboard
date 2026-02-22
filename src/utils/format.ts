export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '--';
  return value.toLocaleString('en-US');
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '--';
  return `${Math.round(value)}%`;
}

export function formatBytes(value: number | null | undefined): string {
  if (value == null || value < 0 || Number.isNaN(value)) return '--';
  if (value === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'] as const;
  const step = 1024;
  const index = Math.min(Math.floor(Math.log(value) / Math.log(step)), units.length - 1);
  const amount = value / step ** index;
  return `${amount.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function formatUtcDateTime(value: string | null | undefined): string {
  if (!value) return '--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(parsed);
}

export function formatDateRangeDays(range: [number, number]): string {
  const [min, max] = range;
  if (Number.isNaN(min) || Number.isNaN(max) || min < 0 || max < min) return '--';
  return `${min}-${max} business days`;
}
