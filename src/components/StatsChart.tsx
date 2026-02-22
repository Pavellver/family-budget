import React, { useState, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Transaction, getGroupByCategory } from '../types';
import { parseDateInput } from '../utils/date';

export type ChartType = 'pie' | 'bar' | 'area' | 'radar';
type GroupByOption = 'category' | 'group';

interface StatsChartProps {
  transactions: Transaction[];
  darkMode: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57', '#ff6b6b'];

export const StatsChart: React.FC<StatsChartProps> = ({ transactions, darkMode }) => {
  const [type, setType] = useState<ChartType>('pie');
  const [groupBy, setGroupBy] = useState<GroupByOption>('category');

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach(t => {
      const key = groupBy === 'category' ? t.category : getGroupByCategory(t.category);
      map.set(key, (map.get(key) || 0) + t.amount);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, groupBy]);

  const { timeData, dataKeys } = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    const allKeys = new Set<string>();

    const sortedTransactions = [...transactions].sort((a, b) => parseDateInput(a.date).getTime() - parseDateInput(b.date).getTime());

    sortedTransactions.forEach(t => {
      const dateStr = parseDateInput(t.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
      const key = groupBy === 'category' ? t.category : getGroupByCategory(t.category);
      
      allKeys.add(key);

      if (!map.has(dateStr)) {
        map.set(dateStr, {});
      }
      const dayData = map.get(dateStr)!;
      dayData[key] = (dayData[key] || 0) + t.amount;
    });

    const keysArray = Array.from(allKeys);
    const normalizedData = Array.from(map.entries()).map(([name, values]) => {
      const row: any = { name };
      keysArray.forEach(k => {
        row[k] = values[k] || 0;
      });
      return row;
    });

    return { timeData: normalizedData, dataKeys: keysArray };
  }, [transactions, groupBy]);

  if (transactions.length === 0) {
    return (
      <div className={`h-[450px] flex items-center justify-center border-2 border-dashed rounded-lg ${darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
        Нет данных за выбранный период
      </div>
    );
  }

  const formatCurrency = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;
  
  const axisColor = darkMode ? '#9ca3af' : '#6b7280';
  const gridColor = darkMode ? '#374151' : '#e5e7eb';
  const tooltipBg = darkMode ? '#1f2937' : '#ffffff';
  const tooltipText = darkMode ? '#f3f4f6' : '#111827';

  return (
    <div className={`h-[480px] w-full p-4 rounded-xl shadow-sm border flex flex-col ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
      
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className={`flex gap-1 p-1 rounded-lg ${darkMode ? 'bg-gray-900/50' : 'bg-gray-100/50'}`}>
          {['pie', 'bar', 'radar', 'area'].map(t => (
            <button 
              key={t} 
              onClick={() => setType(t as ChartType)} 
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                type === t 
                  ? (darkMode ? 'bg-blue-600 text-white shadow' : 'bg-blue-100 text-blue-700 shadow') 
                  : (darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100')
              }`}
            >
              {t === 'pie' ? 'Круг' : t === 'bar' ? 'Столбцы' : t === 'radar' ? 'Радар' : 'График'}
            </button>
          ))}
        </div>

        <div className={`flex items-center rounded-lg p-1 border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
           <button 
             onClick={() => setGroupBy('group')}
             className={`px-3 py-1 text-xs rounded-md transition-all ${groupBy === 'group' ? (darkMode ? 'bg-gray-700 text-white shadow' : 'bg-white text-blue-600 shadow') : (darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')}`}
           >
             По Группам
           </button>
           <button 
             onClick={() => setGroupBy('category')}
             className={`px-3 py-1 text-xs rounded-md transition-all ${groupBy === 'category' ? (darkMode ? 'bg-gray-700 text-white shadow' : 'bg-white text-blue-600 shadow') : (darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')}`}
           >
             Детально
           </button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'pie' ? (
            <PieChart>
              <Pie 
                data={chartData} 
                cx="50%" cy="45%" 
                innerRadius={80} outerRadius={130} 
                paddingAngle={2} dataKey="value"
              >
                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={formatCurrency} contentStyle={{ backgroundColor: tooltipBg, color: tooltipText, border: 'none' }} />
              <Legend verticalAlign="bottom" align="center" height={36} />
            </PieChart>
          ) : type === 'bar' ? (
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fill: axisColor}} />
              <Tooltip formatter={formatCurrency} cursor={{fill: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}} contentStyle={{ backgroundColor: tooltipBg, color: tooltipText, border: 'none' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Bar>
            </BarChart>
          ) : type === 'radar' ? (
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid stroke={gridColor} />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: axisColor }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
              <Radar name="Сумма" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip formatter={formatCurrency} contentStyle={{ backgroundColor: tooltipBg, color: tooltipText, border: 'none' }} />
            </RadarChart>
          ) : (
            <AreaChart data={timeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{fontSize: 12, fill: axisColor}} minTickGap={30} />
              <YAxis tick={{fontSize: 12, fill: axisColor}} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <Tooltip formatter={formatCurrency} contentStyle={{ backgroundColor: tooltipBg, color: tooltipText, border: 'none' }} />
              <Legend verticalAlign="bottom" height={36}/>
              
              {dataKeys.map((key, index) => (
                <Area 
                  key={key}
                  type="monotone" 
                  dataKey={key} 
                  stackId="1" 
                  stroke={COLORS[index % COLORS.length]} 
                  fill={COLORS[index % COLORS.length]} 
                  fillOpacity={0.7}
                  connectNulls
                />
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
