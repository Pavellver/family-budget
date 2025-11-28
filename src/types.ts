export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  createdAt: number;
  type: TransactionType; // Новое поле
}

// --- РАСХОДЫ ---
export const EXPENSE_GROUPS = {
  "Фикс": [
    "Коммуналка", "ЭЭ", "Вода", "Газ", 
    "Гараж", "Телефон", "Интернет", "Авто"
  ],
  "Еда": [
    "Еда вне дома", "Продукты", "Сладости", "Кафе и рестораны"
  ],
  "Разное": [
    "Транспорт", "Одежда", "Здоровье", "Для дома", 
    "Красота и уход", "Развлечения и хобби", 
    "Домашние животные", "Подарки", 
    "Путешествия и поездки", "Прочее"
  ]
} as const;

// --- ДОХОДЫ (НОВОЕ) ---
export const INCOME_GROUPS = {
  "Активный": [
    "Зарплата", "Аванс", "Бонус", "Премия", "Подработка"
  ],
  "Пассивный": [
    "Кэшбэк", "Проценты по вкладу", "Дивиденды", "Аренда"
  ],
  "Прочее": [
    "Подарки", "Продажа вещей", "Возврат долга", "Другое"
  ]
} as const;

// Собираем всё вместе для типизации
export const ALL_EXPENSE_CATS = Object.values(EXPENSE_GROUPS).flat();
export const ALL_INCOME_CATS = Object.values(INCOME_GROUPS).flat();

// Хелпер теперь ищет везде
export const getGroupByCategory = (cat: string): string => {
  // Ищем в расходах
  for (const [group, items] of Object.entries(EXPENSE_GROUPS)) {
    if ((items as readonly string[]).includes(cat)) return group;
  }
  // Ищем в доходах
  for (const [group, items] of Object.entries(INCOME_GROUPS)) {
    if ((items as readonly string[]).includes(cat)) return group;
  }
  return "Разное";
};