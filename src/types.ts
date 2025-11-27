export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  createdAt: number;
}

export const CATEGORIES = [
  'Продукты',
  'Транспорт',
  'Жилье',
  'Здоровье',
  'Развлечения',
  'Одежда',
  'Техника',
  'Образование',
  'Животные', // Новое
  'Подарки',  // Новое
  'Другое'
];

export type Category = typeof CATEGORIES[number];