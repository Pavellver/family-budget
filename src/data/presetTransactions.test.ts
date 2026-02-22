import { describe, expect, it } from 'vitest';
import { createPresetTransactions } from './presetTransactions';
import { getCurrentMonthDateRange, getPreviousMonthDateRange } from '../utils/date';

describe('preset transactions', () => {
  it('returns non-empty mixed income/expense data', () => {
    const preset = createPresetTransactions();
    expect(preset.length).toBeGreaterThan(0);
    expect(preset.some((t) => t.type === 'income')).toBe(true);
    expect(preset.some((t) => t.type === 'expense')).toBe(true);
  });

  it('contains boundary dates between previous and current month', () => {
    const preset = createPresetTransactions();
    const now = new Date();
    const prev = getPreviousMonthDateRange(now);
    const curr = getCurrentMonthDateRange(now);
    const dates = new Set(preset.map((t) => t.date));

    expect(dates.has(prev.end)).toBe(true);
    expect(dates.has(curr.start)).toBe(true);
  });
});
