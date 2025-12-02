import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area
} from 'recharts';
import { Transaction } from '../types';

interface AnalysisDashboardProps {
  transactions: Transaction[];
  darkMode: boolean;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ transactions, darkMode }) => {
  
  // 1. Агрегация данных по месяцам
  const data = useMemo(() => {
    const map = new Map<string, { date: string, income: number, expense: number, net: number }>();

    transactions.forEach(t => {
      // Ключ формата YYYY-MM
      const dateObj = new Date(t.date);
      const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      
      if (!map.has(key)) {
        map.set(key, { date: key, income: 0, expense: 0, net: 0 });
      }
      
      const entry = map.get(key)!;
      if (t.type === 'income') entry.income += t.amount;
      else entry.expense += t.amount;
      entry.net = entry.income - entry.expense;
    });

    // Сортировка по дате
    const sortedData = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Добавляем красивое название месяца
    return sortedData.map(item => {
      const [y, m] = item.date.split('-');
      const monthName = new Date(parseInt(y), parseInt(m) - 1).toLocaleString('ru-RU', { month: 'short', year: '2-digit' });
      return { ...item, name: monthName };
    });
  }, [transactions]);

  // 2. Расчет KPI
  const kpi = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;
    
    // Норма сбережений = (Баланс / Доходы) * 100
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : '0';
    
    // Средний расход в месяц
    const distinctMonths = new Set(transactions.map(t => t.date.substring(0, 7))).size || 1;
    const avgMonthlyExpense = totalExpense / distinctMonths;

    return { totalIncome, totalExpense, balance, savingsRate, avgMonthlyExpense };
  }, [transactions]);

  const axisColor = darkMode ? '#9ca3af' : '#6b7280';
  const gridColor = darkMode ? '#374151' : '#e5e7eb';
  const tooltipBg = darkMode ? '#1f2937' : '#ffffff';
  const tooltipText = darkMode ? '#f3f4f6' : '#111827';
  
  const formatCurrency = (val: number) => val.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽';

  if (transactions.length === 0) return <div className="text-center p-10 opacity-50">Нет данных для анализа</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* --- KPI КАРТОЧКИ --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Баланс" value={kpi.balance} color={kpi.balance >= 0 ? 'text-green-500' : 'text-red-500'} darkMode={darkMode} />
        <KpiCard title="Норма сбережений" value={`${kpi.savingsRate}%`} sub="от доходов" darkMode={darkMode} />
        <KpiCard title="Средний расход" value={formatCurrency(kpi.avgMonthlyExpense)} sub="в месяц" darkMode={darkMode} />
        <KpiCard title="Всего заработано" value={formatCurrency(kpi.totalIncome)} color="text-blue-500" darkMode={darkMode} />
      </div>

      {/* --- ГРАФИК 1: Доходы vs Расходы --- */}
      <div className={`p-5 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <h3 className="text-lg font-semibold mb-4">Финансовый поток (Income vs Expense)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="name" tick={{fill: axisColor, fontSize: 12}} />
              <YAxis tick={{fill: axisColor, fontSize: 12}} tickFormatter={(val) => `${val / 1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: tooltipBg, color: tooltipText, borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="income" name="Доходы" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="expense" name="Расходы" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- ГРАФИК 2: Чистый денежный поток (Net Flow) --- */}
      <div className={`p-5 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <h3 className="text-lg font-semibold mb-4">Чистый денежный поток (Net Cash Flow)</h3>
        <p className="text-xs opacity-50 mb-2">Разница между доходами и расходами (накопления)</p>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="name" tick={{fill: axisColor, fontSize: 12}} />
              <YAxis tick={{fill: axisColor, fontSize: 12}} tickFormatter={(val) => `${val / 1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: tooltipBg, color: tooltipText, borderRadius: '8px', border: 'none' }}
                formatter={(value: number) => [formatCurrency(value), 'Чистая прибыль']}
              />
              <Area type="monotone" dataKey="net" stroke="#8884d8" fillOpacity={1} fill="url(#colorNet)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

// Простой компонент карточки
const KpiCard = ({ title, value, sub, color, darkMode }: any) => (
  <div className={`p-4 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
    <div className="text-xs opacity-60 font-medium uppercase tracking-wider">{title}</div>
    <div className={`text-2xl font-bold mt-1 ${color || (darkMode ? 'text-white' : 'text-gray-900')}`}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
    {sub && <div className="text-xs opacity-50 mt-1">{sub}</div>}
  </div>
);