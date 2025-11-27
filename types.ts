export interface Transaction {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  amount: number;
  category: string;
  description: string;
  createdAt: number;
}

export const CATEGORIES = [
  "Продукты",
  "Автомобиль",
  "Хозтовары",
  "Подарки",
  "Здоровье",
  "Кафе/Развлечения",
  "Коммуналка",
  "Одежда",
  "Транспорт",
  "Прочее"
] as const;

export type Category = typeof CATEGORIES[number];

export interface MonthlyStats {
  month: string; // YYYY-MM
  total: number;
}
