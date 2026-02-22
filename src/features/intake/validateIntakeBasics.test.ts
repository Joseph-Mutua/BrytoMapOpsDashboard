import { describe, expect, it } from 'vitest';
import { validateIntakeBasics } from '@/features/intake/validateIntakeBasics';

describe('validateIntakeBasics', () => {
  it('requires address and coordinates', () => {
    const issues = validateIntakeBasics({
      nearestAddress: '',
      lat: null,
      lng: null,
    });

    expect(issues.map((issue) => issue.field)).toEqual(['nearestAddress', 'coordinates']);
  });

  it('flags invalid numeric coordinate ranges and NaN', () => {
    expect(
      validateIntakeBasics({
        nearestAddress: '1458 Cedar View Dr',
        lat: 200,
        lng: -97.7,
      }).some((issue) => issue.field === 'coordinates'),
    ).toBe(true);

    expect(
      validateIntakeBasics({
        nearestAddress: '1458 Cedar View Dr',
        lat: Number.NaN,
        lng: -97.7,
      }).some((issue) => issue.field === 'coordinates'),
    ).toBe(true);
  });

  it('passes a valid intake seed', () => {
    expect(
      validateIntakeBasics({
        nearestAddress: '1458 Cedar View Dr, Georgetown, TX',
        lat: 30.6852,
        lng: -97.7442,
      }),
    ).toEqual([]);
  });
});
