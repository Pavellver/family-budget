import { Transaction } from '../types';
import { parseDateInput } from './date';

export type MonthData = {
  date: string;
  name: string;
  income: number;
  expense: number;
  net: number;
  balance: number;
};

export type ForecastData = {
  name: string;
  forecast: number;
  isForecast: boolean;
};

export type RankedItem = {
  name: string;
  value: number;
  count?: number;
  sub?: string;
};

export type AnalysisMetrics = {
  currentMonth: MonthData;
  currentIncome: number;
  currentExpense: number;
  currentNet: number;
  previousIncome: number;
  previousExpense: number;
  previousNet: number;
  totalIncome: number;
  totalExpense: number;
  turnover: number;
  savingsRateValue: number;
  topExpenseCategories: RankedItem[];
  topIncomeSources: RankedItem[];
  topPlaces: RankedItem[];
  paymentMethods: RankedItem[];
  categoryChanges: RankedItem[];
  maxTxName: string;
  maxTxVal: number;
  projectedNet: number;
  runwayMonths: number;
};

export type AnalysisDashboardData = {
  monthlyData: MonthData[];
  trendData: ForecastData[];
  analysis: AnalysisMetrics;
};

export const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export const monthName = (key: string) => {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1).toLocaleString('ru-RU', { month: 'short', year: '2-digit' });
};

export const formatCurrency = (val: number) => val.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽';

export const formatDelta = (value: number) => `${value > 0 ? '+' : ''}${value.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽`;

export const percent = (value: number, total: number) => total > 0 ? Math.round((value / total) * 100) : 0;

const sum = (items: Transaction[], type?: Transaction['type']) =>
  items
    .filter(item => !type || item.type === type)
    .reduce((total, item) => total + item.amount, 0);

const rankBy = (items: Transaction[], keyGetter: (item: Transaction) => string, limit = 5): RankedItem[] => {
  const map = new Map<string, { value: number; count: number }>();

  items.forEach(item => {
    const key = keyGetter(item).trim() || 'Не указано';
    const current = map.get(key) || { value: 0, count: 0 };
    map.set(key, { value: current.value + item.amount, count: current.count + 1 });
  });

  return Array.from(map.entries())
    .map(([name, data]) => ({ name, value: data.value, count: data.count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
};

const getLastTwelveMonths = (transactions: Transaction[]) => {
  const sortedByDate = [...transactions].sort((a, b) => parseDateInput(a.date).getTime() - parseDateInput(b.date).getTime());
  const lastTx = sortedByDate[sortedByDate.length - 1];
  const end = parseDateInput(lastTx.date);
  end.setDate(1);

  const start = new Date(end);
  start.setMonth(start.getMonth() - 11);

  const filteredTx = transactions.filter(t => {
    const d = parseDateInput(t.date);
    const tVal = d.getFullYear() * 12 + d.getMonth();
    const sVal = start.getFullYear() * 12 + start.getMonth();
    const eVal = end.getFullYear() * 12 + end.getMonth();
    return tVal >= sVal && tVal <= eVal;
  });

  return { filteredTx, lastDateObj: end };
};

const buildMonthlyData = (filteredTx: Transaction[], lastDateObj: Date) => {
  const map = new Map<string, { date: string; income: number; expense: number; net: number; balance: number }>();
  const loopDate = new Date(lastDateObj);
  loopDate.setMonth(loopDate.getMonth() - 11);

  for (let i = 0; i < 12; i++) {
    const key = monthKey(loopDate);
    map.set(key, { date: key, income: 0, expense: 0, net: 0, balance: 0 });
    loopDate.setMonth(loopDate.getMonth() + 1);
  }

  filteredTx.forEach(t => {
    const key = monthKey(parseDateInput(t.date));
    if (!map.has(key)) return;

    const entry = map.get(key)!;
    if (t.type === 'income') entry.income += t.amount;
    else entry.expense += t.amount;
    entry.net = entry.income - entry.expense;
  });

  let runningBalance = 0;
  return Array.from(map.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(item => {
      runningBalance += item.net;
      return { ...item, name: monthName(item.date), balance: runningBalance };
    });
};

const buildTrendData = (monthlyData: MonthData[]): ForecastData[] => {
  const activeMonths = monthlyData.filter(month => month.income > 0 || month.expense > 0);
  const avgMonthlyNet = activeMonths.length
    ? activeMonths.reduce((total, month) => total + month.net, 0) / activeMonths.length
    : 0;
  const latestMonth = monthlyData[monthlyData.length - 1];
  let forecastBalance = latestMonth?.balance || 0;
  const forecastData: ForecastData[] = latestMonth
    ? [{ name: latestMonth.name, forecast: latestMonth.balance, isForecast: false }]
    : [];

  for (let i = 1; i <= 6; i++) {
    forecastBalance += avgMonthlyNet;
    forecastData.push({
      name: `+${i} мес`,
      forecast: forecastBalance,
      isForecast: true,
    });
  }

  return forecastData;
};

const buildMetrics = (filteredTx: Transaction[], monthlyData: MonthData[], lastDateObj: Date): AnalysisMetrics => {
  const currentMonth = monthlyData[monthlyData.length - 1] || {
    date: monthKey(lastDateObj),
    name: monthName(monthKey(lastDateObj)),
    income: 0,
    expense: 0,
    net: 0,
    balance: 0,
  };
  const previousMonth = monthlyData[monthlyData.length - 2] || { date: '', name: '-', income: 0, expense: 0, net: 0, balance: 0 };
  const currentTx = filteredTx.filter(item => monthKey(parseDateInput(item.date)) === currentMonth.date);
  const previousTx = filteredTx.filter(item => monthKey(parseDateInput(item.date)) === previousMonth.date);
  const expenses = filteredTx.filter(t => t.type === 'expense');
  const incomes = filteredTx.filter(t => t.type === 'income');
  const currentExpenses = currentTx.filter(t => t.type === 'expense');
  const currentIncome = sum(currentTx, 'income');
  const currentExpense = sum(currentTx, 'expense');
  const previousIncome = sum(previousTx, 'income');
  const previousExpense = sum(previousTx, 'expense');
  const totalIncome = sum(filteredTx, 'income');
  const totalExpense = sum(filteredTx, 'expense');
  const balance = totalIncome - totalExpense;
  const activeMonths = monthlyData.filter(month => month.income > 0 || month.expense > 0);
  const avgMonthlyExpense = totalExpense / (activeMonths.length || 1);
  const topExpenseCategories = rankBy(expenses, item => item.category, 5);
  const topIncomeSources = rankBy(incomes, item => item.category, 5);
  const topPlaces = rankBy(currentExpenses.length ? currentExpenses : expenses, item => item.store || 'Место не указано', 5);
  const paymentMethods = rankBy(expenses, item => item.paymentMethod || 'Не указано', 5);
  const maxTx = [...expenses].sort((a, b) => b.amount - a.amount)[0];
  const currentCategoryTotals = rankBy(currentExpenses, item => item.category, 50);
  const previousCategoryTotals = rankBy(previousTx.filter(t => t.type === 'expense'), item => item.category, 50);
  const previousMap = new Map(previousCategoryTotals.map(item => [item.name, item.value]));
  const categoryChanges = currentCategoryTotals
    .map(item => ({
      name: item.name,
      value: item.value - (previousMap.get(item.name) || 0),
      sub: `${formatCurrency(item.value)} за ${currentMonth.name}`,
    }))
    .filter(item => item.value !== 0)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 5);
  const lastTxDate = filteredTx.length
    ? filteredTx.reduce((latest, item) => Math.max(latest, parseDateInput(item.date).getTime()), 0)
    : lastDateObj.getTime();
  const lastDate = new Date(lastTxDate);
  const daysInMonth = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 0).getDate();
  const elapsedDay = Math.max(1, lastDate.getDate());
  const projectedExpense = currentExpense > 0 ? (currentExpense / elapsedDay) * daysInMonth : 0;

  return {
    currentMonth,
    currentIncome,
    currentExpense,
    currentNet: currentIncome - currentExpense,
    previousIncome,
    previousExpense,
    previousNet: previousIncome - previousExpense,
    totalIncome,
    totalExpense,
    turnover: totalIncome + totalExpense,
    savingsRateValue: totalIncome > 0 ? (balance / totalIncome) * 100 : 0,
    topExpenseCategories,
    topIncomeSources,
    topPlaces,
    paymentMethods,
    categoryChanges,
    maxTxName: maxTx ? maxTx.description || maxTx.category : '-',
    maxTxVal: maxTx ? maxTx.amount : 0,
    projectedNet: currentIncome - projectedExpense,
    runwayMonths: avgMonthlyExpense > 0 ? Math.max(0, balance / avgMonthlyExpense) : 0,
  };
};

export const buildAnalysisDashboardData = (transactions: Transaction[]): AnalysisDashboardData => {
  if (transactions.length === 0) {
    const lastDateObj = new Date();
    const monthlyData: MonthData[] = [];
    return {
      monthlyData,
      trendData: [],
      analysis: buildMetrics([], monthlyData, lastDateObj),
    };
  }

  const { filteredTx, lastDateObj } = getLastTwelveMonths(transactions);
  const monthlyData = buildMonthlyData(filteredTx, lastDateObj);
  const trendData = buildTrendData(monthlyData);
  const analysis = buildMetrics(filteredTx, monthlyData, lastDateObj);

  return { monthlyData, trendData, analysis };
};
