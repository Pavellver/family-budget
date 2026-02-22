import { describe, expect, it } from 'vitest';
import { createPresetTransactions } from './presetTransactions';
import { parseDateInput } from '../utils/date';

describe('preset transactions', () => {
  it('returns a full-year mixed dataset', () => {
    const preset = createPresetTransactions();
    expect(preset.length).toBe(84);
    expect(preset.some((t) => t.type === 'income')).toBe(true);
    expect(preset.some((t) => t.type === 'expense')).toBe(true);
  });

  it('keeps annual income 10-15% above annual expenses with deficit months present', () => {
    const preset = createPresetTransactions();
    const totalIncome = preset.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = preset.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const ratio = totalIncome / totalExpense;

    expect(ratio).toBeGreaterThanOrEqual(1.1);
    expect(ratio).toBeLessThanOrEqual(1.15);

    const monthTotals = new Map<string, { income: number; expense: number }>();
    preset.forEach((t) => {
      const d = parseDateInput(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthTotals.has(key)) {
        monthTotals.set(key, { income: 0, expense: 0 });
      }
      const target = monthTotals.get(key)!;
      if (t.type === 'income') target.income += t.amount;
      else target.expense += t.amount;
    });

    const deficitMonths = Array.from(monthTotals.values()).filter((m) => m.expense > m.income).length;
    expect(deficitMonths).toBeGreaterThanOrEqual(2);
  });
});
