export type TransactionType = 'expense' | 'income';
export type CategoryGroups = Record<string, string[]>;

export interface CategorySettings {
  expenseGroups: CategoryGroups;
  incomeGroups: CategoryGroups;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  store: string;
  paymentMethod: string;
  createdAt: number;
  type: TransactionType;
}

export const EXPENSE_GROUPS: CategoryGroups = {
  "Фикс": [
    "Коммуналка", "ЭЭ", "Вода", "Газ",
    "Гараж", "Телефон", "Интернет"
  ],
  "Автомобиль": [
    "Ремонт", "Страховка", "Заправка", "Обслуживание", "Запчасти"
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
};

export const INCOME_GROUPS: CategoryGroups = {
  "Активный": [
    "Зарплата", "Аванс", "Бонус", "Премия", "Подработка"
  ],
  "Пассивный": [
    "Кэшбэк", "Проценты по вкладу", "Дивиденды"
  ],
  "Прочее": [
    "Подарки", "Продажа вещей", "Возврат долга", "Другое"
  ]
};

export const getAllCategories = (groups: CategoryGroups): string[] => Object.values(groups).flat();

export const ALL_EXPENSE_CATS = getAllCategories(EXPENSE_GROUPS);
export const ALL_INCOME_CATS = getAllCategories(INCOME_GROUPS);

export const getGroupByCategory = (cat: string, groups?: CategoryGroups): string => {
  const groupSets = groups ? [groups] : [EXPENSE_GROUPS, INCOME_GROUPS];

  for (const groupSet of groupSets) {
    for (const [group, items] of Object.entries(groupSet)) {
      if (items.includes(cat)) return group;
    }
  }

  return "Разное";
};
