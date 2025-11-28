import React, { useMemo } from 'react'; // Убрали useState, так как управление теперь снаружи
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Transaction, getGroupByCategory } from '../types';

export type ChartType = 'pie' | 'bar' | 'area' | 'radar';
export type GroupByOption = 'category' | 'group'; // Экспортируем тип для App.tsx

interface StatsChartProps {
  transactions: Transaction[];
  type: ChartType;
  darkMode: boolean;
  groupBy: GroupByOption; // Теперь принимаем это как пропс
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57', '#ff6b6b'];

export const StatsChart: React.FC<StatsChartProps> = ({ transactions, type, darkMode, groupBy }) => {
  
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

  const timeData = useMemo(() => {
    const map = new Map<string, number>();
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    sorted.forEach(t => {
      const dateStr = new Date(t.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
      map.set(dateStr, (map.get(dateStr) || 0) + t.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions]);

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
    // Увеличили высоту до h-[450px] чтобы выровнять с левой колонкой
    <div className={`h-[450px] w-full p-4 rounded-xl shadow-sm border flex flex-col ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'pie' ? (
            <PieChart>
              <Pie 
                data={chartData} 
                cx="50%" 
                cy="50%" // Подняли чуть выше, чтобы легенда влезла снизу
                innerRadius={80} 
                outerRadius={130} 
                paddingAngle={2} 
                dataKey="value"
              >
                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={formatCurrency} contentStyle={{ backgroundColor: tooltipBg, color: tooltipText, border: 'none' }} />
              {/* Легенда снизу */}
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
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false}/>
              <Radar name="Расходы" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip formatter={formatCurrency} contentStyle={{ backgroundColor: tooltipBg, color: tooltipText, border: 'none' }} />
            </RadarChart>
          ) : (
            <AreaChart data={timeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{fontSize: 12, fill: axisColor}} minTickGap={30} />
              <YAxis tick={{fontSize: 12, fill: axisColor}} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <Tooltip formatter={formatCurrency} contentStyle={{ backgroundColor: tooltipBg, color: tooltipText, border: 'none' }} />
              <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};