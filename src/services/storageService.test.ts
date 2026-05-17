import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_PAYMENT_METHODS,
  loadCategorySettings,
  clearData,
  loadPaymentMethods,
  loadTransactions,
  normalizeCategorySettings,
  normalizePaymentMethods,
  saveCategorySettings,
  savePaymentMethods,
  saveTransactions,
} from './storageService';
import { Transaction } from '../types';

type StorageMap = Record<string, string>;

const createLocalStorageMock = () => {
  let store: StorageMap = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

const tx = (overrides: Partial<Transaction>): Transaction => ({
  id: 't1',
  date: '2025-01-10',
  amount: 1000,
  category: 'Продукты',
  description: 'test',
  store: '',
  paymentMethod: '',
  type: 'expense',
  createdAt: 1,
  ...overrides,
});

describe('storageService', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true,
      writable: true,
    });
  });

  it('saves and loads transactions', () => {
    const source = [tx({ id: 'a' }), tx({ id: 'b', type: 'income', category: 'Зарплата' })];
    saveTransactions(source);

    const loaded = loadTransactions();
    expect(loaded).toHaveLength(2);
    expect(loaded[0].id).toBe('a');
    expect(loaded[1].type).toBe('income');
  });

  it('migrates old records without type and normalizes date', () => {
    const legacy = [
      {
        id: 'legacy',
        date: '2025-01-31T00:00:00.000Z',
        amount: 1500,
        category: 'Продукты',
        description: 'legacy',
        createdAt: 2,
      },
    ];
    localStorage.setItem('budget_transactions', JSON.stringify(legacy));

    const loaded = loadTransactions();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].type).toBe('expense');
    expect(loaded[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(loaded[0].store).toBe('');
    expect(loaded[0].paymentMethod).toBe('');
  });

  it('clearData("income") removes only income transactions', () => {
    saveTransactions([
      tx({ id: 'e1', type: 'expense', category: 'Продукты' }),
      tx({ id: 'i1', type: 'income', category: 'Зарплата' }),
      tx({ id: 'e2', type: 'expense', category: 'Интернет' }),
    ]);

    const result = clearData('income');
    expect(result).toHaveLength(2);
    expect(result.every((item) => item.type === 'expense')).toBe(true);
  });

  it('clearData("all") removes everything', () => {
    saveTransactions([tx({ id: 'any' })]);
    const result = clearData('all');
    expect(result).toHaveLength(0);
    expect(loadTransactions()).toHaveLength(0);
  });

  it('stores custom payment methods per browser', () => {
    savePaymentMethods(['ВТБ', 'Сбер', 'сбер', '', 'нал']);

    expect(loadPaymentMethods()).toEqual(['ВТБ', 'Сбер', 'нал']);
  });

  it('falls back to default payment methods when customization is empty', () => {
    expect(normalizePaymentMethods([])).toEqual(DEFAULT_PAYMENT_METHODS);
  });

  it('stores custom category settings separately from transactions', () => {
    saveCategorySettings({
      expenseGroups: {
        Автомобиль: ['Заправка', 'Запчасти'],
        Дом: ['Ремонт'],
      },
      incomeGroups: {
        Работа: ['Зарплата'],
      },
    });
    saveTransactions([tx({ id: 'any' })]);
    clearData('all');

    const settings = loadCategorySettings();
    expect(loadTransactions()).toHaveLength(0);
    expect(settings.expenseGroups.Автомобиль).toEqual(['Заправка', 'Запчасти']);
    expect(settings.incomeGroups.Работа).toEqual(['Зарплата']);
  });

  it('normalizes invalid category settings back to defaults', () => {
    const settings = normalizeCategorySettings({
      expenseGroups: {
        '': [''],
      },
      incomeGroups: {
        Активный: ['Зарплата', 'Зарплата', ''],
      },
    });

    expect(settings.expenseGroups.Автомобиль).toContain('Запчасти');
    expect(settings.incomeGroups.Активный).toEqual(['Зарплата']);
  });
});
