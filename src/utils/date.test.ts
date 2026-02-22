import { describe, expect, it } from 'vitest';
import { getCurrentMonthDateRange, getMonthDateRange, getPreviousMonthDateRange, parseDateInput, toDateInputValue } from './date';

describe('date utils', () => {
  it('keeps round-trip for YYYY-MM-DD without timezone shift', () => {
    const iso = '2025-01-31';
    expect(toDateInputValue(parseDateInput(iso))).toBe(iso);
  });

  it('builds correct range for a 31-day month', () => {
    expect(getMonthDateRange(2025, 0)).toEqual({
      start: '2025-01-01',
      end: '2025-01-31',
    });
  });

  it('builds previous month range across year boundary', () => {
    const base = new Date(2025, 0, 15);
    expect(getPreviousMonthDateRange(base)).toEqual({
      start: '2024-12-01',
      end: '2024-12-31',
    });
  });

  it('builds current month range for February in leap year', () => {
    const base = new Date(2024, 1, 10);
    expect(getCurrentMonthDateRange(base)).toEqual({
      start: '2024-02-01',
      end: '2024-02-29',
    });
  });
});
