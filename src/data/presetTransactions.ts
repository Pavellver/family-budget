import { Transaction } from '../types';
import { toDateInputValue } from '../utils/date';

const buildId = (seed: string) => `preset_${seed}`;

export const createPresetTransactions = (): Transaction[] => {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const transactions: Transaction[] = [];

  const monthlyExpenses = [95000, 102000, 98000, 111000, 123000, 107000, 93000, 118000, 101000, 112000, 116000, 105000];
  const monthlyIncomes = [105000, 113000, 108000, 122000, 120000, 128000, 106000, 128000, 115000, 125000, 111000, 132000];

  for (let i = 0; i < 12; i++) {
    const month = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - 11 + i, 1);
    const y = month.getFullYear();
    const m = month.getMonth();

    const expense = monthlyExpenses[i];
    const income = monthlyIncomes[i];

    const expenseParts = [
      { day: 4, amount: Math.round(expense * 0.27), category: 'Продукты', description: 'Продукты и бытовые покупки' },
      { day: 10, amount: Math.round(expense * 0.18), category: 'Коммуналка', description: 'ЖКУ и обязательные платежи' },
      { day: 17, amount: Math.round(expense * 0.15), category: 'Транспорт', description: 'Транспорт и авто' },
      { day: 25, amount: expense - Math.round(expense * 0.27) - Math.round(expense * 0.18) - Math.round(expense * 0.15), category: 'Развлечения и хобби', description: 'Досуг и прочие траты' },
    ];

    const incomeParts = [
      { day: 1, amount: Math.round(income * 0.72), category: 'Зарплата', description: 'Основной доход' },
      { day: 14, amount: Math.round(income * 0.18), category: 'Подработка', description: 'Дополнительный доход' },
      { day: 28, amount: income - Math.round(income * 0.72) - Math.round(income * 0.18), category: 'Кэшбэк', description: 'Кэшбэк и возвраты' },
    ];

    incomeParts.forEach((item, idx) => {
      transactions.push({
        id: buildId(`inc_${i}_${idx}`),
        date: toDateInputValue(new Date(y, m, item.day)),
        amount: item.amount,
        category: item.category,
        description: item.description,
        type: 'income',
        createdAt: Date.now() - (400 - i * 10 - idx),
      });
    });

    expenseParts.forEach((item, idx) => {
      transactions.push({
        id: buildId(`exp_${i}_${idx}`),
        date: toDateInputValue(new Date(y, m, item.day)),
        amount: item.amount,
        category: item.category,
        description: item.description,
        type: 'expense',
        createdAt: Date.now() - (350 - i * 10 - idx),
      });
    });
  }

  return transactions.sort((a, b) => (a.date < b.date ? 1 : -1));
};
