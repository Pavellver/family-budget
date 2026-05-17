import { TransactionType } from '../types';

export const APP_VERSION = '0.2.0';

export type PeriodMode = 'currentMonth' | 'prevMonth' | 'last30days' | 'thisYear' | 'all' | 'custom';
export type SortKey = 'date' | 'amount';
export type SortDirection = 'asc' | 'desc';
export type AppMode = 'expenses' | 'income' | 'analysis' | 'management';
export type EntryMode = Extract<AppMode, 'expenses' | 'income'>;
export type CategoryKind = TransactionType;
export type ClearMode = 'all' | 'income' | 'expenses';

export const QUICK_AMOUNT_STEPS = [100, 500, 1000];

export const PERIOD_OPTIONS: Array<{ mode: Exclude<PeriodMode, 'custom'>; label: string }> = [
  { mode: 'currentMonth', label: 'Текущий месяц' },
  { mode: 'prevMonth', label: 'Прошлый месяц' },
  { mode: 'last30days', label: '30 дней' },
  { mode: 'thisYear', label: 'Этот год' },
  { mode: 'all', label: 'Всё время' },
];

export const PERIOD_LABELS: Record<PeriodMode, string> = {
  currentMonth: 'Текущий месяц',
  prevMonth: 'Прошлый месяц',
  last30days: 'Последние 30 дней',
  thisYear: 'Этот год',
  all: 'Все время',
  custom: 'Свой период',
};

export const IMPORT_CATEGORY_GROUPS: Record<TransactionType, string> = {
  expense: 'Импорт расходов',
  income: 'Импорт доходов',
};

export const getEntryTypeByMode = (mode: AppMode): TransactionType => mode === 'income' ? 'income' : 'expense';

export const getThemeColor = (mode: AppMode) => mode === 'income' ? 'green' : 'blue';

export const getPlaceFieldLabel = (mode: AppMode) => mode === 'income' ? 'Источник' : 'Место / получатель';

export const getPlaceFieldPlaceholder = (mode: AppMode) =>
  mode === 'income' ? 'Например: работодатель' : 'Например: Озон, АЗС, УК';

export const getMissingPlaceText = (mode: AppMode) => mode === 'income' ? 'Источник не указан' : 'Место не указано';
