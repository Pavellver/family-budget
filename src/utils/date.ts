export const toDateInputValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateInput = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const getTodayDateInput = (): string => toDateInputValue(new Date());

export const shiftDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const getMonthDateRange = (year: number, monthIndex: number): { start: string; end: string } => ({
  start: toDateInputValue(new Date(year, monthIndex, 1)),
  end: toDateInputValue(new Date(year, monthIndex + 1, 0)),
});

export const getPreviousMonthDateRange = (baseDate: Date): { start: string; end: string } =>
  getMonthDateRange(baseDate.getFullYear(), baseDate.getMonth() - 1);

export const getCurrentMonthDateRange = (baseDate: Date): { start: string; end: string } =>
  getMonthDateRange(baseDate.getFullYear(), baseDate.getMonth());
