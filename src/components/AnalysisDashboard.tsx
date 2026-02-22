import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ComposedChart, Area, Line
} from 'recharts';
import { Transaction } from '../types';
import { parseDateInput } from '../utils/date';

interface AnalysisDashboardProps {
  transactions: Transaction[];
  darkMode: boolean;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ transactions, darkMode }) => {
  const { filteredTx, lastDateObj } = useMemo(() => {
    if (transactions.length === 0) return { filteredTx: [], lastDateObj: new Date() };

    const sortedByDate = [...transactions].sort((a, b) => parseDateInput(a.date).getTime() - parseDateInput(b.date).getTime());
    const lastTx = sortedByDate[sortedByDate.length - 1];

    const end = parseDateInput(lastTx.date);
    end.setDate(1); 

    const start = new Date(end);
    start.setMonth(start.getMonth() - 11);

    const filtered = transactions.filter(t => {
      const d = parseDateInput(t.date);
      const tVal = d.getFullYear() * 12 + d.getMonth();
      const sVal = start.getFullYear() * 12 + start.getMonth();
      const eVal = end.getFullYear() * 12 + end.getMonth();
      return tVal >= sVal && tVal <= eVal;
    });

    return { filteredTx: filtered, lastDateObj: end };
  }, [transactions]);

  const { monthlyData, trendData } = useMemo(() => {
    if (filteredTx.length === 0) return { monthlyData: [], trendData: [] };

    const map = new Map<string, { date: string, income: number, expense: number, net: number, balance: 0 }>();

    const loopDate = new Date(lastDateObj);
    loopDate.setMonth(loopDate.getMonth() - 11);

    for (let i = 0; i < 12; i++) {
        const key = `${loopDate.getFullYear()}-${String(loopDate.getMonth() + 1).padStart(2, '0')}`;
        map.set(key, { date: key, income: 0, expense: 0, net: 0, balance: 0 });
        loopDate.setMonth(loopDate.getMonth() + 1);
    }

    filteredTx.forEach(t => {
      const d = parseDateInput(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (map.has(key)) {
        const entry = map.get(key)!;
        if (t.type === 'income') entry.income += t.amount;
        else entry.expense += t.amount;
        entry.net = entry.income - entry.expense;
      }
    });

    const sorted = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
    
    let runningBalance = 0;
    const historyData = sorted.map(item => {
        runningBalance += item.net;
        const [y, m] = item.date.split('-');
        const monthName = new Date(Number(y), Number(m) - 1).toLocaleString('ru-RU', { month: 'short', year: '2-digit' });
        return { ...item, name: monthName, balance: runningBalance };
    });

    const totalNet = historyData.reduce((sum, m) => sum + m.net, 0);
    const monthsCount = historyData.length || 1;
    const avgMonthlyNet = totalNet / monthsCount;

    const forecastData = [];
    let forecastBalance = runningBalance; 
    
    if (historyData.length > 0) {
        forecastData.push({
            name: historyData[historyData.length - 1].name,
            forecast: historyData[historyData.length - 1].balance,
            isForecast: false
        });
    }

    for (let i = 1; i <= 6; i++) {
        forecastBalance += avgMonthlyNet;
        forecastData.push({
            name: `+${i} мес`,
            forecast: forecastBalance,
            isForecast: true
        });
    }

    return { monthlyData: historyData, trendData: forecastData };
  }, [filteredTx, lastDateObj]);

  const kpi = useMemo(() => {
    const totalIncome = filteredTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : '0';
    const turnover = totalIncome + totalExpense;
    const avgMonthlyExpense = totalExpense / (monthlyData.length || 1);

    const expenses = filteredTx.filter(t => t.type === 'expense');
    const incomes = filteredTx.filter(t => t.type === 'income');
    
    const expMap = new Map<string, number>();
    expenses.forEach(t => expMap.set(t.category, (expMap.get(t.category) || 0) + t.amount));
    const topExp = Array.from(expMap.entries()).sort((a, b) => b[1] - a[1])[0];

    const incMap = new Map<string, number>();
    incomes.forEach(t => incMap.set(t.category, (incMap.get(t.category) || 0) + t.amount));
    const topInc = Array.from(incMap.entries()).sort((a, b) => b[1] - a[1])[0];

    const maxTx = expenses.sort((a, b) => b.amount - a.amount)[0];

    return { 
        totalIncome, totalExpense, balance, savingsRate, avgMonthlyExpense, turnover,
        topExpenseName: topExp ? topExp[0] : '-', topExpenseVal: topExp ? topExp[1] : 0,
        topIncomeName: topInc ? topInc[0] : '-', topIncomeVal: topInc ? topInc[1] : 0,
        maxTxName: maxTx ? maxTx.description || maxTx.category : '-', maxTxVal: maxTx ? maxTx.amount : 0
    };
  }, [filteredTx, monthlyData]);

  const axisColor = darkMode ? '#9ca3af' : '#6b7280';
  const gridColor = darkMode ? '#374151' : '#e5e7eb';
  const tooltipBg = darkMode ? '#1f2937' : '#ffffff';
  const tooltipText = darkMode ? '#f3f4f6' : '#111827';
  const formatCurrency = (val: number) => val.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽';

  if (transactions.length === 0) return <div className="text-center p-10 opacity-50">Нет данных для анализа</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Баланс" value={kpi.balance} color={kpi.balance >= 0 ? 'text-green-500' : 'text-red-500'} darkMode={darkMode} />
        <KpiCard title="Сальдо доходы/расходы" value={`${kpi.savingsRate}%`} sub="от доходов" darkMode={darkMode} />
        <KpiCard title="Ср. расход / мес" value={formatCurrency(kpi.avgMonthlyExpense)} sub="за период" darkMode={darkMode} />
        <KpiCard title="Суммарный оборот" value={formatCurrency(kpi.turnover)} sub="доходы + расходы" color="text-blue-500" darkMode={darkMode} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Топ расход (Категория)" value={kpi.topExpenseName} sub={formatCurrency(kpi.topExpenseVal)} color="text-red-400" darkMode={darkMode} />
        <KpiCard title="Топ доход (Источник)" value={kpi.topIncomeName} sub={formatCurrency(kpi.topIncomeVal)} color="text-green-400" darkMode={darkMode} />
        <KpiCard title="Самая крупная покупка" value={formatCurrency(kpi.maxTxVal)} sub={kpi.maxTxName} darkMode={darkMode} />
        <KpiCard title="Прогноз через полгода" value={trendData.length > 0 ? formatCurrency(trendData[trendData.length-1].forecast) : '-'} sub="при текущем тренде" color="text-purple-500" darkMode={darkMode} />
      </div>

      <div className={`p-5 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <h3 className="text-lg font-semibold mb-4">Динамика за 12 месяцев</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="name" tick={{fill: axisColor, fontSize: 12}} />
              <YAxis tick={{fill: axisColor, fontSize: 12}} tickFormatter={(val) => `${val / 1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, color: tooltipText, border: 'none', borderRadius: '8px' }} formatter={(val:number) => formatCurrency(val)} />
              <Legend />
              <Bar dataKey="income" name="Доходы" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Расходы" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`p-5 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <h3 className="text-lg font-semibold mb-2">Тренд накоплений</h3>
        <p className="text-xs opacity-50 mb-4">Пунктирная линия — прогноз на 6 месяцев, если динамика сохранится.</p>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={[...monthlyData, ...trendData.filter(t => t.isForecast)]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="name" tick={{fill: axisColor, fontSize: 12}} />
              <YAxis tick={{fill: axisColor, fontSize: 12}} tickFormatter={(val) => `${val / 1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, color: tooltipText, border: 'none', borderRadius: '8px' }} formatter={(val:number) => formatCurrency(val)} />
              <Legend />
              <Area type="monotone" dataKey="balance" name="Факт" stroke="#8884d8" fill="url(#colorBalance)" strokeWidth={3} />
              <Line type="monotone" dataKey="forecast" name="Прогноз" stroke="#a855f7" strokeDasharray="5 5" strokeWidth={2} dot={{r: 4}} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

interface KpiCardProps {
  title: string;
  value: number | string;
  sub?: string;
  color?: string;
  darkMode: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, sub, color, darkMode }) => (
  <div className={`p-4 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
    <div className="text-xs opacity-60 font-medium uppercase tracking-wider truncate">{title}</div>
    <div className={`text-xl md:text-2xl font-bold mt-1 truncate ${color || (darkMode ? 'text-white' : 'text-gray-900')}`}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
    {sub && <div className="text-xs opacity-50 mt-1 truncate">{sub}</div>}
  </div>
);
