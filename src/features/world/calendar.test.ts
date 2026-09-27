import { describe, expect, it } from 'vitest';
import { addDays, berlinDate, daysBetween, isIsoDate, seasonOf } from './calendar';

describe('calendar', () => {
  it('uses Heilbronn time, not UTC', () => {
    // 22:30 UTC on 27 Sep is already 00:30 on 28 Sep in Europe/Berlin (summer time)
    expect(berlinDate(new Date('2026-09-27T22:30:00Z'))).toBe('2026-09-28');
    expect(berlinDate(new Date('2026-12-31T22:59:00Z'))).toBe('2026-12-31');
  });

  it('counts calendar days across DST changes', () => {
    expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2);
    expect(addDays('2026-09-28', 365)).toBe('2027-09-28');
  });

  it('knows the seasons', () => {
    expect(seasonOf('2026-09-28')).toBe('autumn');
    expect(seasonOf('2027-01-15')).toBe('winter');
    expect(seasonOf('2027-04-01')).toBe('spring');
    expect(seasonOf('2027-07-01')).toBe('summer');
  });

  it('validates ISO dates', () => {
    expect(isIsoDate('2026-02-30')).toBe(false);
    expect(isIsoDate('2026-09-28')).toBe(true);
  });
});
