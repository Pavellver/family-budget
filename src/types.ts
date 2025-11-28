export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  createdAt: number;
}

export const CATEGORY_GROUPS = {
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

export const ALL_CATEGORIES = Object.values(CATEGORY_GROUPS).flat();

export type Category = typeof ALL_CATEGORIES[number];
export type MainGroup = keyof typeof CATEGORY_GROUPS;

// ... (начало файла не трогаем)

// Хелпер: узнать главную группу по подкатегории
export const getGroupByCategory = (cat: string): string => {
  for (const [group, items] of Object.entries(CATEGORY_GROUPS)) {
    // Приведение типа (items as readonly string[]) успокаивает TypeScript
    if ((items as readonly string[]).includes(cat)) {
      return group;
    }
  }
  return "Разное";
};