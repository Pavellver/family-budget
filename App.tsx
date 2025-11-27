import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Transaction, CATEGORIES, Category } from './types';
import { saveTransactions, loadTransactions, exportData, importData } from './services/storageService';
import { Button } from './components/ui/Button';
import { StatsChart, ChartType } from './components/StatsChart';

// Icons
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
);
const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
);
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
);

type PeriodMode = 'currentMonth' | 'prevMonth' | 'thisYear' | 'all' | 'custom';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  
  // View/Filter State
  const [showSettings, setShowSettings] = useState(false);
  const [periodMode, setPeriodMode] = useState<PeriodMode>('currentMonth');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(CATEGORIES));
  
  // Chart State
  const [chartType, setChartType] = useState<ChartType>('pie');

  const periodMenuRef = useRef<HTMLDivElement>(null);

  // Initial Load
  useEffect(() => {
    const data = loadTransactions();
    setTransactions(data);
  }, []);

  // Save on change
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  // Click outside to close period menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (periodMenuRef.current && !periodMenuRef.current.contains(event.target as Node)) {
        setShowPeriodMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date || !category) return;

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      date,
      amount: parseFloat(amount),
      category,
      description,
      createdAt: Date.now(),
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setAmount('');
    setDescription('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await importData(file);
        if (confirm(`Найдено ${imported.length} записей. Заменить текущие данные (OK) или добавить к ним (Cancel)?`)) {
           setTransactions(imported);
        } else {
           setTransactions(prev => {
             const existingIds = new Set(prev.map(t => t.id));
             const newUnique = imported.filter(t => !existingIds.has(t.id));
             return [...newUnique, ...prev].sort((a, b) => b.date.localeCompare(a.date));
           });
        }
        alert('Данные успешно загружены!');
      } catch (err) {
        alert('Ошибка при чтении файла. Проверьте формат.');
      }
    }
  };

  const toggleCategory = (cat: string) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(cat)) {
      newSet.delete(cat);
    } else {
      newSet.add(cat);
    }
    setSelectedCategories(newSet);
  };

  const toggleAllCategories = () => {
    if (selectedCategories.size === CATEGORIES.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(CATEGORIES));
    }
  };

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startStr = '';
    let endStr = '';

    // Determine Date Range
    switch (periodMode) {
      case 'currentMonth':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        startStr = startOfMonth.toISOString().split('T')[0];
        endStr = endOfMonth.toISOString().split('T')[0];
        break;
      case 'prevMonth':
        const startOfPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPrev = new Date(now.getFullYear(), now.getMonth(), 0);
        startStr = startOfPrev.toISOString().split('T')[0];
        endStr = endOfPrev.toISOString().split('T')[0];
        break;
      case 'thisYear':
        startStr = `${now.getFullYear()}-01-01`;
        endStr = `${now.getFullYear()}-12-31`;
        break;
      case 'custom':
        startStr = customStart;
        endStr = customEnd;
        break;
      case 'all':
      default:
        // No date filter
        break;
    }

    return transactions.filter(t => {
      // Date Check
      if (periodMode !== 'all') {
        if (t.date < startStr || t.date > endStr) return false;
      }
      // Category Check
      if (!selectedCategories.has(t.category)) return false;
      
      return true;
    });
  }, [transactions, periodMode, customStart, customEnd, selectedCategories]);

  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const globalTotal = useMemo(() => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Helper to display current period name
  const getPeriodLabel = () => {
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const now = new Date();
    if (periodMode === 'currentMonth') return `${months[now.getMonth()]} ${now.getFullYear()}`;
    if (periodMode === 'prevMonth') {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return `${months[prev.getMonth()]} ${prev.getFullYear()}`;
    }
    if (periodMode === 'thisYear') return `Год ${now.getFullYear()}`;
    if (periodMode === 'all') return 'За все время';
    if (periodMode === 'custom') return 'Свой период';
    return 'Период';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Семейный Бюджет</h1>
            <p className="text-xs text-gray-500">Контроль финансов</p>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
             {showSettings ? 'Закрыть' : 'Меню'}
          </button>
        </div>
        
        {/* Settings / Data Panel */}
        {showSettings && (
          <div className="bg-gray-100 border-b border-gray-200 p-4 animate-in slide-in-from-top-2">
            <div className="max-w-5xl mx-auto flex flex-wrap gap-4 items-center">
              <Button onClick={() => exportData(transactions)} variant="outline" className="flex items-center gap-2 bg-white text-sm shadow-sm">
                <DownloadIcon /> Экспорт (JSON)
              </Button>
              <div className="relative">
                 <input 
                   type="file" 
                   accept=".json" 
                   onChange={handleImport}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 />
                 <Button variant="outline" className="flex items-center gap-2 bg-white text-sm shadow-sm">
                   <UploadIcon /> Импорт (JSON)
                 </Button>
              </div>
              <div className="ml-auto text-sm text-gray-500 hidden sm:block">
                Всего записей: {transactions.length} | Общий расход: {globalTotal.toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* Input Form */}
        <section className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Добавить расход</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Сумма (₽)</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow shadow-sm"
                placeholder="0.00"
              />
            </div>
            
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Дата</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              />
            </div>

            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Категория</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Назначение (опционально)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Например: Ашан"
                className="w-full p-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              />
            </div>

            <div className="lg:col-span-1 flex items-end">
              <Button type="submit" className="w-full font-bold shadow-md active:scale-95 transform">
                Добавить
              </Button>
            </div>
          </form>
        </section>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Info Card with Advanced Filters */}
          <div className="md:col-span-1 space-y-4">
             {/* Totals & Date Picker */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl shadow-md p-6 relative">
              <div className="flex justify-between items-center mb-4 relative" ref={periodMenuRef}>
                 <h3 className="font-medium text-blue-100">Расходы</h3>
                 
                 {/* Custom Dropdown Trigger */}
                 <button 
                    onClick={() => setShowPeriodMenu(!showPeriodMenu)}
                    className="flex items-center gap-1 bg-blue-800/50 hover:bg-blue-800/70 px-3 py-1.5 rounded-lg text-sm transition-colors"
                 >
                   {getPeriodLabel()} <ChevronDownIcon />
                 </button>

                 {/* Dropdown Menu */}
                 {showPeriodMenu && (
                   <div className="absolute right-0 top-full mt-2 w-64 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 z-30 p-2 animate-in fade-in zoom-in-95 duration-100">
                     <div className="space-y-1">
                       <button onClick={() => { setPeriodMode('currentMonth'); setShowPeriodMenu(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${periodMode === 'currentMonth' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}>
                         Текущий месяц
                       </button>
                       <button onClick={() => { setPeriodMode('prevMonth'); setShowPeriodMenu(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${periodMode === 'prevMonth' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}>
                         Прошлый месяц
                       </button>
                       <button onClick={() => { setPeriodMode('thisYear'); setShowPeriodMenu(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${periodMode === 'thisYear' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}>
                         В этом году
                       </button>
                       <button onClick={() => { setPeriodMode('all'); setShowPeriodMenu(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${periodMode === 'all' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}>
                         За все время
                       </button>
                       <div className="border-t border-gray-100 my-1 pt-1">
                         <div className="px-3 py-1 text-xs text-gray-400 font-medium uppercase">Свой период</div>
                         <div className="p-2 space-y-2">
                            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-full text-sm p-1 border rounded bg-gray-50"/>
                            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-full text-sm p-1 border rounded bg-gray-50"/>
                            <button 
                              onClick={() => { if(customStart && customEnd) { setPeriodMode('custom'); setShowPeriodMenu(false); } }}
                              className="w-full bg-blue-600 text-white text-sm py-1 rounded hover:bg-blue-700"
                            >
                              Применить
                            </button>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}
              </div>

              <p className="text-4xl font-bold tracking-tight break-words">
                {totalAmount.toLocaleString('ru-RU')} ₽
              </p>
              <p className="mt-2 text-sm text-blue-100 opacity-80">
                Записей: {filteredTransactions.length}
              </p>
            </div>

            {/* Interactive Category Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
               <div className="flex justify-between items-center mb-3">
                 <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                   <FilterIcon /> Фильтр категорий
                 </h3>
                 <button onClick={toggleAllCategories} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                    {selectedCategories.size === CATEGORIES.length ? 'Сбросить' : 'Выбрать все'}
                 </button>
               </div>
               <div className="flex flex-wrap gap-2">
                 {CATEGORIES.map(cat => {
                   const isSelected = selectedCategories.has(cat);
                   return (
                     <button 
                       key={cat} 
                       onClick={() => toggleCategory(cat)}
                       className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200
                         ${isSelected 
                           ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                           : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                         }`}
                     >
                       {cat}
                     </button>
                   )
                 })}
               </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="md:col-span-2 space-y-4">
             {/* Chart Controls */}
             <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex justify-center gap-2">
                <button 
                  onClick={() => setChartType('pie')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${chartType === 'pie' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Круговая
                </button>
                <button 
                  onClick={() => setChartType('bar')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${chartType === 'bar' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Столбчатая
                </button>
                <button 
                  onClick={() => setChartType('area')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${chartType === 'area' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Динамика
                </button>
             </div>
             
             <StatsChart transactions={filteredTransactions} type={chartType} />
          </div>
        </div>

        {/* Transactions Table */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-gray-700">История операций</h3>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md">
              {getPeriodLabel()}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-4 py-3 w-32">Дата</th>
                  <th className="px-4 py-3 w-40">Категория</th>
                  <th className="px-4 py-3">Описание</th>
                  <th className="px-4 py-3 text-right">Сумма</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      Нет данных, соответствующих выбранным фильтрам.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt)
                    .map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-4 py-3 text-gray-600 font-medium">
                        {new Date(t.date).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                          {t.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 truncate max-w-xs">
                        {t.description || '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-800">
                        {t.amount.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => handleDelete(t.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                          title="Удалить"
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;