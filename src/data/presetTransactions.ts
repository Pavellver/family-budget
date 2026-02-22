import { Transaction } from '../types';
import { toDateInputValue } from '../utils/date';

const buildId = (seed: string) => `preset_${seed}`;

export const createPresetTransactions = (): Transaction[] => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  return [
    {
      id: buildId('salary_prev'),
      date: toDateInputValue(prevMonthStart),
      amount: 120000,
      category: 'Зарплата',
      description: 'Зарплата за прошлый месяц',
      type: 'income',
      createdAt: Date.now() - 11,
    },
    {
      id: buildId('food_prev'),
      date: toDateInputValue(new Date(prevMonthStart.getFullYear(), prevMonthStart.getMonth(), 10)),
      amount: 12400,
      category: 'Продукты',
      description: 'Большая закупка',
      type: 'expense',
      createdAt: Date.now() - 10,
    },
    {
      id: buildId('cashback_prev'),
      date: toDateInputValue(prevMonthEnd),
      amount: 2200,
      category: 'Кэшбэк',
      description: 'Кэшбэк в последний день месяца',
      type: 'income',
      createdAt: Date.now() - 9,
    },
    {
      id: buildId('salary_this'),
      date: toDateInputValue(monthStart),
      amount: 125000,
      category: 'Зарплата',
      description: 'Зарплата в начале месяца',
      type: 'income',
      createdAt: Date.now() - 8,
    },
    {
      id: buildId('internet_this'),
      date: toDateInputValue(new Date(monthStart.getFullYear(), monthStart.getMonth(), 2)),
      amount: 790,
      category: 'Интернет',
      description: 'Ежемесячный платеж',
      type: 'expense',
      createdAt: Date.now() - 7,
    },
    {
      id: buildId('food_this'),
      date: toDateInputValue(new Date(monthStart.getFullYear(), monthStart.getMonth(), 5)),
      amount: 9100,
      category: 'Продукты',
      description: 'Продукты на неделю',
      type: 'expense',
      createdAt: Date.now() - 6,
    },
    {
      id: buildId('freelance_this'),
      date: toDateInputValue(new Date(monthStart.getFullYear(), monthStart.getMonth(), 12)),
      amount: 18000,
      category: 'Подработка',
      description: 'Доп. проект',
      type: 'income',
      createdAt: Date.now() - 5,
    },
    {
      id: buildId('transport_this'),
      date: toDateInputValue(new Date(monthStart.getFullYear(), monthStart.getMonth(), 14)),
      amount: 3200,
      category: 'Транспорт',
      description: 'Топливо и парковка',
      type: 'expense',
      createdAt: Date.now() - 4,
    },
    {
      id: buildId('health_this'),
      date: toDateInputValue(new Date(monthStart.getFullYear(), monthStart.getMonth(), 18)),
      amount: 4500,
      category: 'Здоровье',
      description: 'Аптека и обследование',
      type: 'expense',
      createdAt: Date.now() - 3,
    },
    {
      id: buildId('bonus_this'),
      date: toDateInputValue(new Date(monthStart.getFullYear(), monthStart.getMonth(), 25)),
      amount: 30000,
      category: 'Бонус',
      description: 'Премия',
      type: 'income',
      createdAt: Date.now() - 2,
    },
    {
      id: buildId('rest_this'),
      date: toDateInputValue(new Date(monthStart.getFullYear(), monthStart.getMonth(), 27)),
      amount: 6500,
      category: 'Развлечения и хобби',
      description: 'Выходные',
      type: 'expense',
      createdAt: Date.now() - 1,
    },
  ];
};
