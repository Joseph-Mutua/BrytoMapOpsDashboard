import { describe, expect, it } from 'vitest';
import { formatBytes, formatDateRangeDays, formatNumber, formatPercent, formatUtcDateTime } from './format';

describe('format helpers', () => {
  it('formats numbers and percentages deterministically', () => {
    expect(formatNumber(12345)).toBe('12,345');
    expect(formatNumber(null)).toBe('--');
    expect(formatPercent(83.6)).toBe('84%');
    expect(formatPercent(undefined)).toBe('--');
  });

  it('formats bytes safely', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(-1)).toBe('--');
  });

  it('formats UTC dates and windows', () => {
    expect(formatUtcDateTime('2026-02-21T18:42:00Z')).toMatch(/Feb/);
    expect(formatUtcDateTime('not-a-date')).toBe('--');
    expect(formatDateRangeDays([2, 10])).toBe('2-10 business days');
    expect(formatDateRangeDays([5, 3])).toBe('--');
  });
});
