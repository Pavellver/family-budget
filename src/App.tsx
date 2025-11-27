import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Transaction, CATEGORIES } from './types';
import { 
  saveTransactions, loadTransactions, 
  exportData, importData, 
  exportToExcel, importFromExcel // Импортируем новые функции
} from './services/storageService';
import { Button } from './components/ui/Button';
import { StatsChart, ChartType } from './components/StatsChart';

// --- ИКОНКИ ---
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>);
const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>);
const ExcelIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>);
const FilterIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>);
const ChevronDownIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>);

type PeriodMode = 'currentMonth' | 'prevMonth' | 'last30days' | 'thisYear' | 'all' | 'custom';

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const formRef = useRef<HTMLElement>(null);
  
  const [showSettings, setShowSettings] = useState(false);
  const [periodMode, setPeriodMode] = useState<PeriodMode>('currentMonth');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(CATEGORIES));
  
  const [chartType, setChartType] = useState<ChartType>('pie');
  const periodMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = loadTransactions();
    setTransactions(data);
  }, []);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

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

    if (editingId) {
      setTransactions(prev => prev.map(t => 
        t.id === editingId ? { ...t, date, amount: parseFloat(amount), category, description } : t
      ));
      setEditingId(null);
    } else {
      const newTransaction: Transaction = {
        id: generateId(),
        date,
        amount: parseFloat(amount),
        category,
        description,
        createdAt: Date.now(),
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
    setAmount('');
    setDescription('');
  };

  const handleEdit = (t: Transaction) => {
    setEditingId(t.id);
    setAmount(t.amount.toString());
    setDate(t.date);
    setCategory(t.category);
    setDescription(t.description);
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      if (editingId === id) cancelEdit();
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await importData(file);
        if (confirm(`JSON: Найдено ${imported.length} записей. Заменить (OK) или добавить (Cancel)?`)) {
           setTransactions(imported);
        } else {
           setTransactions(prev => {
             const existingIds = new Set(prev.map(t => t.id));
             const newUnique = imported.filter(t => !existingIds.has(t.id));
             return [...newUnique, ...prev].sort((a, b) => b.date.localeCompare(a.date));
           });
        }
        alert('Успешно!');
      } catch (err) { alert('Ошибка JSON.'); }
    }
  };

  // Обработчик Excel
  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await importFromExcel(file);
        if (confirm(`Excel: Найдено ${imported.length} строк. Заменить (OK) или добавить (Cancel)?`)) {
           setTransactions(imported);
        } else {
           setTransactions(prev => [...imported, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
        }
        alert('Excel загружен!');
      } catch (err) { alert('Ошибка Excel.'); }
    }
  };

  const toggleCategory = (cat: string) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(cat)) newSet.delete(cat);
    else newSet.add(cat);
    setSelectedCategories(newSet);
  };

  const toggleAllCategories = () => {
    if (selectedCategories.size === CATEGORIES.length) setSelectedCategories(new Set());
    else setSelectedCategories(new Set(CATEGORIES));
  };

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startStr = '';
    let endStr = '';

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
      case 'last30days':
        const d = new Date();
        d.setDate(d.getDate() - 30);
        startStr = d.toISOString().split('T')[0];
        endStr = new Date().toISOString().split('T')[0];
        break;
      case 'thisYear':
        startStr = `${now.getFullYear()}-01-01`;
        endStr = `${now.getFullYear()}-12-31`;
        break;
      case 'custom':
        startStr = customStart;
        endStr = customEnd;
        break;
      case 'all': default: break;
    }

    return transactions.filter(t => {
      if (periodMode !== 'all') {
        if (t.date < startStr || t.date > endStr) return false;
      }
      if (!selectedCategories.has(t.category)) return false;
      return true;
    });
  }, [transactions, periodMode, customStart, customEnd, selectedCategories]);

  const totalAmount = useMemo(() => filteredTransactions.reduce((sum, t) => sum + t.amount, 0), [filteredTransactions]);
  const globalTotal = useMemo(() => transactions.reduce((sum, t) => sum + t.amount, 0), [transactions]);

  const getPeriodLabel = () => {
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const now = new Date();
    if (periodMode === 'currentMonth') return `${months[now.getMonth()]} ${now.getFullYear()}`;
    if (periodMode === 'prevMonth') {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return `${months[prev.getMonth()]} ${prev.getFullYear()}`;
    }
    if (periodMode === 'last30days') return 'Последние 30 дней';
    if (periodMode === 'thisYear') return `Год ${now.getFullYear()}`;
    if (periodMode === 'all') return 'За все время';
    if (periodMode === 'custom') return 'Свой период';
    return 'Период';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Семейный Бюджет</h1>
            <p className="text-xs text-gray-500">Контроль финансов</p>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
             {showSettings ? 'Закрыть' : 'Меню'}
          </button>
        </div>
        
        {showSettings && (
          <div className="bg-gray-100 border-b border-gray-200 p-4 animate-in slide-in-from-top-2">
            <div className="max-w-5xl mx-auto flex flex-wrap gap-4 items-center">
              {/* JSON Кнопки */}
              <div className="flex gap-2">
                <Button onClick={() => exportData(transactions)} variant="outline" className="flex items-center gap-2 bg-white text-xs shadow-sm">
                  <DownloadIcon /> JSON
                </Button>
                <div className="relative">
                  <input type="file" accept=".json" onChange={handleImport} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                  <Button variant="outline" className="flex items-center gap-2 bg-white text-xs shadow-sm">
                    <UploadIcon /> JSON
                  </Button>
                </div>
              </div>

              {/* EXCEL Кнопки (Новые) */}
              <div className="flex gap-2 border-l pl-4 border-gray-300">
                <Button onClick={() => exportToExcel(transactions)} variant="outline" className="flex items-center gap-2 bg-white text-xs shadow-sm text-green-700 border-green-200 hover:bg-green-50">
                  <ExcelIcon /> Excel Скачать
                </Button>
                <div className="relative">
                  <input type="file" accept=".xlsx, .xls" onChange={handleExcelImport} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                  <Button variant="outline" className="flex items-center gap-2 bg-white text-xs shadow-sm text-green-700 border-green-200 hover:bg-green-50">
                    <UploadIcon /> Excel Загрузить
                  </Button>
                </div>
              </div>

              <div className="ml-auto text-sm text-gray-500 hidden sm:block">
                Записей: {transactions.length} | Итого: {globalTotal.toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <section ref={formRef} className={`rounded-xl shadow-sm p-5 border transition-colors ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">{editingId ? 'Редактирование' : 'Добавить расход'}</h2>
            {editingId && <button onClick={cancelEdit} className="text-sm text-red-600 hover:underline">Отменить</button>}
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Сумма (₽)</label>
              <input type="number" step="100" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900" placeholder="0"/>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Дата</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900"/>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Категория</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Назначение</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Например: соленья" className="w-full p-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900"/>
            </div>
            <div className="lg:col-span-1 flex items-end">
              <Button type="submit" className={`w-full font-bold shadow-md active:scale-95 transform ${editingId ? 'bg-green-600 hover:bg-green-700' : ''}`}>{editingId ? 'Сохранить' : 'Добавить'}</Button>
            </div>
          </form>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl shadow-md p-6 relative">
              <div className="flex justify-between items-center mb-4 relative" ref={periodMenuRef}>
                 <h3 className="font-medium text-blue-100">Расходы</h3>
                 <button onClick={() => setShowPeriodMenu(!showPeriodMenu)} className="flex items-center gap-1 bg-blue-800/50 hover:bg-blue-800/70 px-3 py-1.5 rounded-lg text-sm transition-colors">
                   {getPeriodLabel()} <ChevronDownIcon />
                 </button>
                 {showPeriodMenu && (
                   <div className="absolute right-0 top-full mt-2 w-64 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 z-30 p-2 animate-in fade-in zoom-in-95 duration-100">
                     <div className="space-y-1">
                       <button onClick={() => { setPeriodMode('currentMonth'); setShowPeriodMenu(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${periodMode === 'currentMonth' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}>Текущий месяц</button>
                       <button onClick={() => { setPeriodMode('prevMonth'); setShowPeriodMenu(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${periodMode === 'prevMonth' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}>Прошлый месяц</button>
                       <button onClick={() => { setPeriodMode('last30days'); setShowPeriodMenu(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${periodMode === 'last30days' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}>Последние 30 дней</button>
                       <button onClick={() => { setPeriodMode('thisYear'); setShowPeriodMenu(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${periodMode === 'thisYear' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}>В этом году</button>
                       <button onClick={() => { setPeriodMode('all'); setShowPeriodMenu(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${periodMode === 'all' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}>За все время</button>
                       <div className="border-t border-gray-100 my-1 pt-1">
                         <div className="px-3 py-1 text-xs text-gray-400 font-medium uppercase">Свой период</div>
                         <div className="p-2 space-y-2">
                            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-full text-sm p-1 border rounded bg-gray-50"/>
                            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-full text-sm p-1 border rounded bg-gray-50"/>
                            <button onClick={() => { if(customStart && customEnd) { setPeriodMode('custom'); setShowPeriodMenu(false); } }} className="w-full bg-blue-600 text-white text-sm py-1 rounded hover:bg-blue-700">Применить</button>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}
              </div>
              <p className="text-4xl font-bold tracking-tight break-words">{totalAmount.toLocaleString('ru-RU')} ₽</p>
              <p className="mt-2 text-sm text-blue-100 opacity-80">Записей: {filteredTransactions.length}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
               <div className="flex justify-between items-center mb-3">
                 <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1"><FilterIcon /> Фильтр категорий</h3>
                 <button onClick={toggleAllCategories} className="text-xs text-blue-600 hover:text-blue-800 font-medium">{selectedCategories.size === CATEGORIES.length ? 'Сбросить' : 'Выбрать все'}</button>
               </div>
               <div className="flex flex-wrap gap-2">
                 {CATEGORIES.map(cat => {
                   const isSelected = selectedCategories.has(cat);
                   return (<button key={cat} onClick={() => toggleCategory(cat)} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${isSelected ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'}`}>{cat}</button>)
                 })}
               </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
             <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex justify-center gap-2 flex-wrap">
                <button onClick={() => setChartType('pie')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${chartType === 'pie' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>Круговая</button>
                <button onClick={() => setChartType('bar')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${chartType === 'bar' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>Столбчатая</button>
                <button onClick={() => setChartType('radar')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${chartType === 'radar' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>Радар</button>
                <button onClick={() => setChartType('area')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${chartType === 'area' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>Динамика</button>
             </div>
             <StatsChart transactions={filteredTransactions} type={chartType} />
          </div>
        </div>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-gray-700">История операций</h3>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md">{getPeriodLabel()}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-4 py-3 w-32">Дата</th>
                  <th className="px-4 py-3 w-40">Категория</th>
                  <th className="px-4 py-3">Описание</th>
                  <th className="px-4 py-3 text-right">Сумма</th>
                  <th className="px-4 py-3 w-20 text-center">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Нет данных, соответствующих выбранным фильтрам.</td></tr>
                ) : (
                  filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt).map((t) => (
                    <tr key={t.id} className={`hover:bg-gray-50 transition-colors group ${editingId === t.id ? 'bg-blue-50' : ''}`}>
                      <td className="px-4 py-3 text-gray-600 font-medium">{new Date(t.date).toLocaleDateString('ru-RU')}</td>
                      <td className="px-4 py-3"><span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">{t.category}</span></td>
                      <td className="px-4 py-3 text-gray-600 truncate max-w-xs">{t.description || '-'}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-800">{t.amount.toLocaleString('ru-RU')} ₽</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => handleEdit(t)} className="text-gray-400 hover:text-blue-500 transition-colors p-1" title="Редактировать"><EditIcon /></button>
                          <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Удалить"><TrashIcon /></button>
                        </div>
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