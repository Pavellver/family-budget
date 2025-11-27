import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis // Новые импорты
} from 'recharts';
import { Transaction } from '../types';

// Добавили 'radar' в типы
export type ChartType = 'pie' | 'bar' | 'area' | 'radar';

interface StatsChartProps {
  transactions: Transaction[];
  type: ChartType;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57', '#ff6b6b'];

export const StatsChart: React.FC<StatsChartProps> = ({ transactions, type }) => {
  
  const categoryData = React.useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach(t => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const timeData = React.useMemo(() => {
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
      <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
        Нет данных за выбранный период
      </div>
    );
  }

  const formatCurrency = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

  return (
    <div className="h-96 w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'pie' ? (
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={formatCurrency} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          ) : type === 'bar' ? (
            <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
              <Tooltip formatter={formatCurrency} cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" fill="#0088FE" radius={[0, 4, 4, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          ) : type === 'radar' ? (
            // НОВАЯ ДИАГРАММА - РАДАР
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoryData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false}/>
              <Radar name="Расходы" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip formatter={formatCurrency} />
            </RadarChart>
          ) : (
            <AreaChart data={timeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{fontSize: 12}} minTickGap={30} />
              <YAxis tick={{fontSize: 12}} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip formatter={formatCurrency} />
              <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};