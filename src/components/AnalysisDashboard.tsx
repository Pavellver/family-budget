import React, { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ComposedChart, Area, Line,
} from 'recharts';
import { Transaction } from '../types';
import {
  RankedItem,
  buildAnalysisDashboardData,
  formatCurrency,
  formatDelta,
  percent,
} from '../utils/analysis';

interface AnalysisDashboardProps {
  transactions: Transaction[];
  darkMode: boolean;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ transactions, darkMode }) => {
  const { monthlyData, trendData, analysis } = useMemo(() => buildAnalysisDashboardData(transactions), [transactions]);
  const axisColor = darkMode ? '#9ca3af' : '#6b7280';
  const gridColor = darkMode ? '#374151' : '#e5e7eb';
  const tooltipBg = darkMode ? '#1f2937' : '#ffffff';
  const tooltipText = darkMode ? '#f3f4f6' : '#111827';

  if (transactions.length === 0) return <div className="text-center p-10 opacity-50">Нет данных для анализа</div>;

  const incomeDelta = analysis.currentIncome - analysis.previousIncome;
  const expenseDelta = analysis.currentExpense - analysis.previousExpense;
  const netDelta = analysis.currentNet - analysis.previousNet;
  const savingsRateText = `${analysis.savingsRateValue.toFixed(1)}%`;
  const pulseTitle = analysis.currentNet >= 0 ? 'Месяц в плюсе' : 'Месяц в минусе';
  const pulseColor = analysis.currentNet >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className={`p-5 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <SectionTitle title="Финансовый пульс" hint="главное сейчас" darkMode={darkMode} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Статус месяца" hint="сальдо сейчас" value={pulseTitle} sub={formatCurrency(analysis.currentNet)} color={pulseColor} darkMode={darkMode} />
          <KpiCard title="Норма накоплений" hint="доля дохода" value={savingsRateText} sub="12 месяцев" color={analysis.savingsRateValue >= 0 ? 'text-green-500' : 'text-red-500'} darkMode={darkMode} />
          <KpiCard title="Запас хода" hint="баланс / расходы" value={`${analysis.runwayMonths.toFixed(1)} мес`} color="text-blue-500" darkMode={darkMode} />
          <KpiCard title="Прогноз месяца" hint="темп месяца" value={formatCurrency(analysis.projectedNet)} color={analysis.projectedNet >= 0 ? 'text-green-500' : 'text-red-500'} darkMode={darkMode} />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Доходы месяца" hint="к прошлому" value={formatCurrency(analysis.currentIncome)} sub={formatDelta(incomeDelta)} color="text-green-500" darkMode={darkMode} />
        <KpiCard title="Расходы месяца" hint="к прошлому" value={formatCurrency(analysis.currentExpense)} sub={formatDelta(expenseDelta)} color="text-red-500" darkMode={darkMode} />
        <KpiCard title="Сальдо месяца" hint="к прошлому" value={formatCurrency(analysis.currentNet)} sub={formatDelta(netDelta)} color={analysis.currentNet >= 0 ? 'text-green-500' : 'text-red-500'} darkMode={darkMode} />
        <KpiCard title="Оборот" hint="все движение" value={formatCurrency(analysis.turnover)} color="text-blue-500" darkMode={darkMode} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Топ расход" hint="главная категория" value={analysis.topExpenseCategories[0]?.name || '-'} sub={formatCurrency(analysis.topExpenseCategories[0]?.value || 0)} color="text-red-400" darkMode={darkMode} />
        <KpiCard title="Топ доход" hint="главный источник" value={analysis.topIncomeSources[0]?.name || '-'} sub={formatCurrency(analysis.topIncomeSources[0]?.value || 0)} color="text-green-400" darkMode={darkMode} />
        <KpiCard title="Крупная покупка" hint="максимальный расход" value={formatCurrency(analysis.maxTxVal)} sub={analysis.maxTxName} darkMode={darkMode} />
        <KpiCard title="Прогноз 6 мес" hint="средний тренд" value={trendData.length > 0 ? formatCurrency(trendData[trendData.length - 1].forecast) : '-'} color="text-purple-500" darkMode={darkMode} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RankedPanel title="Где выросли расходы" hint="рост месяца" items={analysis.categoryChanges} darkMode={darkMode} formatValue={formatDelta} />
        <RankedPanel title="Места / получатели" hint="куда ушло" items={analysis.topPlaces} darkMode={darkMode} formatValue={formatCurrency} />
        <RankedPanel title="Способы оплаты" hint="чем платили" items={analysis.paymentMethods} darkMode={darkMode} formatValue={formatCurrency} total={analysis.totalExpense} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankedPanel title="Топ категорий расходов" hint="структура трат" items={analysis.topExpenseCategories} darkMode={darkMode} formatValue={formatCurrency} total={analysis.totalExpense} />
        <RankedPanel title="Топ источников дохода" hint="структура доходов" items={analysis.topIncomeSources} darkMode={darkMode} formatValue={formatCurrency} total={analysis.totalIncome} />
      </div>

      <div className={`p-5 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <SectionTitle title="Динамика за 12 месяцев" hint="месяц к месяцу" darkMode={darkMode} />
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} />
              <YAxis tick={{ fill: axisColor, fontSize: 12 }} tickFormatter={(val) => `${val / 1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, color: tooltipText, border: 'none', borderRadius: '8px' }} formatter={(val: number) => formatCurrency(val)} />
              <Legend />
              <Bar dataKey="income" name="Доходы" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Расходы" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`p-5 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <SectionTitle title="Тренд накоплений" hint="факт и прогноз" darkMode={darkMode} />
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={[...monthlyData, ...trendData.filter(t => t.isForecast)]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} />
              <YAxis tick={{ fill: axisColor, fontSize: 12 }} tickFormatter={(val) => `${val / 1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, color: tooltipText, border: 'none', borderRadius: '8px' }} formatter={(val: number) => formatCurrency(val)} />
              <Legend />
              <Area type="monotone" dataKey="balance" name="Факт" stroke="#8884d8" fill="url(#colorBalance)" strokeWidth={3} />
              <Line type="monotone" dataKey="forecast" name="Прогноз" stroke="#a855f7" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

interface KpiCardProps {
  title: string;
  hint: string;
  value: number | string;
  sub?: string;
  color?: string;
  darkMode: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, hint, value, sub, color, darkMode }) => (
  <div className={`p-4 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
    <div className="text-xs opacity-60 font-medium uppercase tracking-wider truncate">{title}</div>
    <div className="text-[11px] opacity-45 mt-0.5 truncate">{hint}</div>
    <div className={`text-xl md:text-2xl font-bold mt-1 truncate ${color || (darkMode ? 'text-white' : 'text-gray-900')}`}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
    {sub && <div className="text-xs opacity-50 mt-1 truncate">{sub}</div>}
  </div>
);

interface RankedPanelProps {
  title: string;
  hint: string;
  items: RankedItem[];
  total?: number;
  darkMode: boolean;
  formatValue: (value: number) => string;
}

const SectionTitle = ({ title, hint, darkMode }: { title: string; hint: string; darkMode: boolean }) => (
  <div className="mb-4">
    <h3 className="text-lg font-semibold">{title}</h3>
    <div className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{hint}</div>
  </div>
);

const RankedPanel: React.FC<RankedPanelProps> = ({ title, hint, items, total, darkMode, formatValue }) => (
  <section className={`p-4 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
    <div className="mb-3">
      <h3 className="text-base font-semibold">{title}</h3>
      <div className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{hint}</div>
    </div>
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="text-sm opacity-50">Нет данных</div>
      ) : (
        items.map(item => {
          const share = total ? percent(item.value, total) : 0;
          const maxValue = Math.max(...items.map(i => Math.abs(i.value)));
          const relativeShare = maxValue > 0 ? (Math.abs(item.value) / maxValue) * 100 : 0;
          const barWidth = total
            ? `${Math.min(100, Math.max(4, share))}%`
            : `${Math.min(100, Math.max(8, relativeShare))}%`;

          return (
            <div key={item.name}>
              <div className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="text-xs opacity-50 truncate">{item.sub || (item.count ? `${item.count} операций` : '')}</div>
                </div>
                <div className="font-semibold whitespace-nowrap">{formatValue(item.value)}</div>
              </div>
              <div className={`mt-1 h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div
                  className={`${item.value >= 0 ? 'bg-blue-500' : 'bg-red-500'} h-full rounded-full`}
                  style={{ width: barWidth }}
                />
              </div>
            </div>
          );
        })
      )}
    </div>
  </section>
);
