import { describe, expect, it } from 'vitest';
import { Transaction } from '../types';
import { buildAnalysisDashboardData } from './analysis';

const tx = (overrides: Partial<Transaction>): Transaction => ({
  id: 'tx',
  date: '2025-01-10',
  amount: 1000,
  category: 'Продукты',
  description: '',
  store: '',
  paymentMethod: '',
  type: 'expense',
  createdAt: 1,
  ...overrides,
});

describe('analysis utils', () => {
  it('builds monthly metrics, rankings and category changes', () => {
    const data = buildAnalysisDashboardData([
      tx({ id: 'income-jan', date: '2025-01-05', amount: 100000, category: 'Зарплата', type: 'income' }),
      tx({ id: 'food-jan', date: '2025-01-10', amount: 1000, category: 'Продукты', store: 'Лента', paymentMethod: 'ВТБ' }),
      tx({ id: 'income-feb', date: '2025-02-05', amount: 110000, category: 'Зарплата', type: 'income' }),
      tx({ id: 'food-feb', date: '2025-02-10', amount: 3000, category: 'Продукты', store: 'Озон', paymentMethod: 'Озон' }),
      tx({ id: 'car-feb', date: '2025-02-11', amount: 2000, category: 'Запчасти', store: 'Авто', paymentMethod: 'ВТБ' }),
    ]);

    expect(data.monthlyData).toHaveLength(12);
    expect(data.analysis.currentMonth.date).toBe('2025-02');
    expect(data.analysis.currentIncome).toBe(110000);
    expect(data.analysis.currentExpense).toBe(5000);
    expect(data.analysis.previousExpense).toBe(1000);
    expect(data.analysis.topExpenseCategories[0].name).toBe('Продукты');
    expect(data.analysis.topPlaces[0].name).toBe('Озон');
    expect(data.analysis.paymentMethods[0].name).toBe('ВТБ');
    expect(data.analysis.categoryChanges[0]).toMatchObject({ name: 'Продукты', value: 2000 });
    expect(data.trendData).toHaveLength(7);
  });
});
