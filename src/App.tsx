import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Transaction, EXPENSE_GROUPS, INCOME_GROUPS, ALL_EXPENSE_CATS, ALL_INCOME_CATS, TransactionType } from './types';
import { saveTransactions, loadTransactions, exportData, importData, exportToExcel, importFromExcel } from './services/storageService';
import { Button } from './components/ui/Button';
import { StatsChart } from './components/StatsChart';
import { CategorySelect } from './components/ui/CategorySelect';

// --- ИКОНКИ ---
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const MoonIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>);
const SunIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>);
const SortIcon = ({ up }: { up: boolean }) => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${up ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>);
const ChevronDownIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>);
const FilterIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>);
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>);
const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>);
const ExcelIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>);
const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);

type PeriodMode = 'currentMonth' | 'prevMonth' | 'last30days' | 'thisYear' | 'all' | 'custom';
type SortKey = 'date' | 'amount';
type SortDirection = 'asc' | 'desc';
type AppMode = 'expenses' | 'income' | 'analysis';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [appMode, setAppMode] = useState<AppMode>('expenses');
  
  const currentCategoryGroups = appMode === 'income' ? INCOME_GROUPS : EXPENSE_GROUPS;
  const currentAllCategories = appMode === 'income' ? ALL_INCOME_CATS : ALL_EXPENSE_CATS;

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const formRef = useRef<HTMLElement>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [periodMode, setPeriodMode] = useState<PeriodMode>('currentMonth');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(currentAllCategories));
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const periodMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCategory(appMode === 'income' ? INCOME_GROUPS["Активный"][0] : EXPENSE_GROUPS["Фикс"][0]);
    setSelectedCategories(new Set(appMode === 'income' ? ALL_INCOME_CATS : ALL_EXPENSE_CATS));
  }, [appMode]);

  useEffect(() => {
    const data = loadTransactions();
    setTransactions(data);
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => { saveTransactions(transactions); }, [transactions]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

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

    const year = new Date(date).getFullYear();
    if (year < 2000 || year > 2099) {
      alert("Пожалуйста, укажите реальный год (2000 - 2099)");
      return;
    }

    const val = parseFloat(amount);
    if (val <= 0) {
      alert("Сумма должна быть больше нуля");
      return;
    }

    const type: TransactionType = appMode === 'income' ? 'income' : 'expense';

    if (editingId) {
      setTransactions(prev => prev.map(t => 
        t.id === editingId ? { ...t, date, amount: val, category, description, type } : t
      ));
      setEditingId(null);
    } else {
      const newTransaction: Transaction = {
        id: generateId(),
        date,
        amount: val,
        category,
        description,
        type,
        createdAt: Date.now(),
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
    setAmount('');
    setDescription('');
  };

  const handleEdit = (t: Transaction) => {
    if (t.type === 'expense' && appMode !== 'expenses') setAppMode('expenses');
    if (t.type === 'income' && appMode !== 'income') setAppMode('income');
    
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
    if (confirm('Удалить запись?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      if (editingId === id) cancelEdit();
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filteredData = useMemo(() => {
    const now = new Date();
    let startStr = '';
    let endStr = '';

    switch (periodMode) {
      case 'currentMonth':
        startStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endStr = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'prevMonth':
        startStr = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        endStr = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        break;
      case 'last30days':
        const d = new Date(); d.setDate(d.getDate() - 30);
        startStr = d.toISOString().split('T')[0];
        endStr = now.toISOString().split('T')[0];
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

    let filtered = transactions.filter(t => {
      if (appMode !== 'analysis') {
        const requiredType = appMode === 'income' ? 'income' : 'expense';
        if (t.type !== requiredType) return false;
      }

      if (periodMode !== 'all') {
        if (t.date < startStr || t.date > endStr) return false;
      }
      if (!selectedCategories.has(t.category)) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!t.description?.toLowerCase().includes(query)) return false;
      }

      return true;
    });

    return filtered.sort((a, b) => {
      let valA = sortKey === 'amount' ? a.amount : new Date(a.date).getTime();
      let valB = sortKey === 'amount' ? b.amount : new Date(b.date).getTime();
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [transactions, periodMode, customStart, customEnd, selectedCategories, sortKey, sortDir, searchQuery, appMode]);

  const paginatedData = useMemo(() => {
    if (itemsPerPage === -1) return filteredData;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(filteredData.length / itemsPerPage);
  const totalAmount = useMemo(() => filteredData.reduce((sum, t) => sum + t.amount, 0), [filteredData]);
  const globalTotal = useMemo(() => transactions.reduce((sum, t) => sum + t.amount, 0), [transactions]);

  const getPeriodLabel = () => {
    if (periodMode === 'currentMonth') return 'Текущий месяц';
    if (periodMode === 'prevMonth') return 'Прошлый месяц';
    if (periodMode === 'last30days') return 'Последние 30 дней';
    if (periodMode === 'thisYear') return 'Этот год';
    if (periodMode === 'all') return 'Все время';
    if (periodMode === 'custom') return 'Свой период';
    return 'Период';
  };

  const toggleAllCategories = () => {
    if (selectedCategories.size === currentAllCategories.length) setSelectedCategories(new Set());
    else setSelectedCategories(new Set(currentAllCategories));
  };

  const toggleCategory = (cat: string) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(cat)) newSet.delete(cat);
    else newSet.add(cat);
    setSelectedCategories(newSet);
  };

  const headerContent = (
    <header className={`sticky top-0 z-20 shadow-sm transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white'}`}>
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Семейный Бюджет</h1>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Контроль финансов</p>
        </div>
        
        <div className="flex gap-3 items-center">
            <div className={`flex rounded-lg p-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <button onClick={() => setAppMode('expenses')} className={`px-3 py-1 text-sm rounded-md transition-all ${appMode === 'expenses' ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>Расходы</button>
              <button onClick={() => setAppMode('income')} className={`px-3 py-1 text-sm rounded-md transition-all ${appMode === 'income' ? 'bg-white text-green-600 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>Доходы</button>
              <button onClick={() => setAppMode('analysis')} className={`px-3 py-1 text-sm rounded-md transition-all ${appMode === 'analysis' ? 'bg-white text-purple-600 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>Анализ</button>
            </div>

          <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-100 text-gray-600'}`}>{darkMode ? <SunIcon /> : <MoonIcon />}</button>
          <button onClick={() => setShowSettings(!showSettings)} className={`px-3 py-1 text-sm rounded-lg border transition-colors ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`}>Меню</button>
        </div>
      </div>
      
      {showSettings && (
        <div className={`p-4 border-b animate-in slide-in-from-top-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
          <div className="max-w-5xl mx-auto flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <Button onClick={() => exportData(transactions)} variant="outline" className={`text-xs ${darkMode ? 'text-gray-200 border-gray-600 hover:bg-gray-700' : ''}`}><DownloadIcon /> JSON</Button>
              <div className="relative">
                <input type="file" accept=".json" onChange={(e) => { const f = e.target.files?.[0]; if(f) importData(f).then(d => { if(confirm('Заменить?')) setTransactions(d); }); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                <Button variant="outline" className={`text-xs ${darkMode ? 'text-gray-200 border-gray-600 hover:bg-gray-700' : ''}`}><UploadIcon /> JSON</Button>
              </div>
            </div>
            <div className="flex gap-2 border-l pl-4 border-gray-400/30">
              <Button onClick={() => exportToExcel(transactions)} variant="outline" className={`text-xs text-green-600 border-green-200 ${darkMode ? 'bg-green-900/20 border-green-800 text-green-400' : ''}`}><ExcelIcon /> Excel Скачать</Button>
              <div className="relative">
                <input type="file" accept=".xlsx" onChange={(e) => { const f = e.target.files?.[0]; if(f) importFromExcel(f).then(d => { if(confirm('Заменить?')) setTransactions(d); }); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                <Button variant="outline" className={`text-xs text-green-600 border-green-200 ${darkMode ? 'bg-green-900/20 border-green-800 text-green-400' : ''}`}><UploadIcon /> Excel Загрузить</Button>
              </div>
            </div>
            <div className="ml-auto text-sm opacity-70 hidden sm:block">Всего записей (всех типов): {transactions.length}</div>
          </div>
        </div>
      )}
    </header>
  );

  if (appMode === 'analysis') {
    return (
      <div className={`min-h-screen transition-colors duration-300 font-sans ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        {headerContent}
        <div className="flex flex-col items-center justify-center h-[80vh] text-center p-4">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold mb-2">Анализ Бюджета</h2>
          <p className="text-gray-500 max-w-md">Здесь будут сводные графики доходов и расходов.</p>
          <div className={`mt-4 p-4 rounded-lg border border-dashed ${darkMode ? 'border-gray-700' : 'border-gray-400'} opacity-50`}>
            <p className="mb-2 text-green-500">Доходы: +{transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0).toLocaleString()} ₽</p>
            <p className="mb-2 text-blue-500">Расходы: -{transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0).toLocaleString()} ₽</p>
            <p className="font-bold border-t pt-2 mt-2">Итого: {(transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) - transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)).toLocaleString()} ₽</p>
          </div>
        </div>
      </div>
    );
  }

  const themeColor = appMode === 'income' ? 'green' : 'blue';

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {headerContent}

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <section ref={formRef} className={`rounded-xl shadow-sm p-5 border transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} ${editingId ? (darkMode ? 'border-blue-700' : 'border-blue-200 bg-blue-50/50') : ''}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{editingId ? 'Редактирование' : `Добавить ${appMode === 'income' ? 'Доход' : 'Расход'}`}</h2>
            {editingId && <button onClick={cancelEdit} className="text-sm text-red-500 hover:underline">Отменить</button>}
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium opacity-70 mb-1">Сумма</label>
              <input
                type="number"
                inputMode="decimal"
                step="100"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full p-2 border rounded-lg focus:ring-2 outline-none shadow-sm ${darkMode ? `bg-gray-700 border-gray-600 text-white focus:ring-${themeColor}-500` : `bg-white border-gray-300 focus:ring-${themeColor}-200`}`}
                placeholder="0"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium opacity-70 mb-1">Дата</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={`w-full p-2 border rounded-lg outline-none shadow-sm ${darkMode ? `bg-gray-700 border-gray-600 text-white focus:ring-${themeColor}-500` : 'bg-white border-gray-300'}`}/>
            </div>
            <div className="lg:col-span-3">
              <label className="block text-xs font-medium opacity-70 mb-1">Категория</label>
              <CategorySelect value={category} onChange={setCategory} groups={currentCategoryGroups} darkMode={darkMode} />
            </div>
            <div className="lg:col-span-3">
              <label className="block text-xs font-medium opacity-70 mb-1">Назначение</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={appMode === 'income' ? "Например: уроки" : "Например: соленья"} className={`w-full p-2 border rounded-lg outline-none shadow-sm ${darkMode ? `bg-gray-700 border-gray-600 text-white focus:ring-${themeColor}-500` : 'bg-white border-gray-300'}`}/>
            </div>
            <div className="lg:col-span-2 flex items-end">
              <Button type="submit" className={`w-full font-bold shadow-md ${editingId ? 'bg-green-600 hover:bg-green-700' : (appMode === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700')}`}>
                {editingId ? 'Сохранить' : 'Добавить'}
              </Button>
            </div>
          </form>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            {/* КАРТОЧКА ИТОГО */}
            <div className={`rounded-xl shadow-md p-6 relative ${appMode === 'income' ? 'bg-gradient-to-br from-green-600 to-green-800' : 'bg-gradient-to-br from-blue-600 to-blue-800'} text-white`}>
              <div className="flex justify-between items-center mb-4 relative" ref={periodMenuRef}>
                 <h3 className="font-medium text-white/90">{appMode === 'income' ? 'Доходы:' : 'Расходы:'}</h3>
                 <button onClick={() => setShowPeriodMenu(!showPeriodMenu)} className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm transition-colors">{getPeriodLabel()} <ChevronDownIcon /></button>
                 {showPeriodMenu && (
                   <div className={`absolute right-0 top-full mt-2 w-64 rounded-xl shadow-xl border z-30 p-2 ${darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-100 text-gray-800'}`}>
                     {['currentMonth', 'prevMonth', 'last30days', 'thisYear', 'all'].map(mode => (
                       <button key={mode} onClick={() => { setPeriodMode(mode as PeriodMode); setShowPeriodMenu(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${periodMode === mode ? `bg-${themeColor}-600 text-white` : 'hover:bg-opacity-10 hover:bg-gray-500'}`}>
                         {mode === 'currentMonth' ? 'Текущий месяц' : mode === 'prevMonth' ? 'Прошлый месяц' : mode === 'last30days' ? '30 дней' : mode === 'thisYear' ? 'Этот год' : 'Всё время'}
                       </button>
                     ))}
                     <div className={`border-t my-1 pt-1 ${darkMode ? 'border-gray-600' : 'border-gray-100'}`}>
                       <div className="px-3 py-1 text-xs opacity-50 font-medium uppercase">Свой период</div>
                       <div className="p-2 space-y-2">
                          <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} 
                            className={`w-full text-sm p-1 border rounded outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}/>
                          <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} 
                            className={`w-full text-sm p-1 border rounded outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}/>
                          <button onClick={() => { if(customStart && customEnd) { setPeriodMode('custom'); setShowPeriodMenu(false); } }} className={`w-full text-white text-sm py-1 rounded ${appMode === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>Применить</button>
                       </div>
                     </div>
                   </div>
                 )}
              </div>
              <p className="text-4xl font-bold tracking-tight break-words">{totalAmount.toLocaleString('ru-RU')} ₽</p>
              <p className="mt-2 text-sm text-white/80">Записей: {filteredData.length}</p>
            </div>

            {/* ФИЛЬТР КАТЕГОРИЙ */}
            <div className={`rounded-xl shadow-sm border p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
               <div className="flex justify-between items-center mb-3">
                 <h3 className="text-sm font-bold opacity-50 uppercase tracking-wider flex items-center gap-1"><FilterIcon /> Категории</h3>
                 <button onClick={toggleAllCategories} className={`text-xs font-medium hover:underline ${appMode === 'income' ? 'text-green-500' : 'text-blue-500'}`}>{selectedCategories.size === currentAllCategories.length ? 'Сбросить' : 'Выбрать все'}</button>
               </div>
               <div className="flex flex-wrap gap-2">
                 {currentAllCategories.map(cat => {
                   const isSelected = selectedCategories.has(cat);
                   const activeClass = appMode === 'income' 
                      ? (darkMode ? 'bg-green-900 border-green-800 text-green-200' : 'bg-green-50 border-green-200 text-green-700')
                      : (darkMode ? 'bg-blue-900 border-blue-800 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-700');
                   const inactiveClass = darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-white border-gray-200 text-gray-400';

                   return (<button key={cat} onClick={() => toggleCategory(cat)} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${isSelected ? activeClass : inactiveClass}`}>{cat}</button>)
                 })}
               </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
             {/* ВСТАВЛЯЕМ ГРАФИК БЕЗ ЛИШНИХ ПРОПСОВ */}
             <StatsChart transactions={filteredData} darkMode={darkMode} />
          </div>
        </div>

        <section className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className={`p-4 border-b flex flex-wrap gap-4 justify-between items-center ${darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50/50 border-gray-100'}`}>
            <div className="flex items-center gap-4">
              <h3 className="font-semibold">История</h3>
              
              <div className="flex items-center gap-2">
                <div className={`flex items-center px-2 py-1 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
                  <span className="opacity-50 mr-1"><SearchIcon /></span>
                  <input 
                    type="text" 
                    placeholder="Поиск по описанию..." 
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="bg-transparent outline-none text-sm w-32 md:w-48 placeholder-gray-400"
                  />
                </div>
                {(searchQuery || filteredData.length !== transactions.length) && (
                  <div className={`text-xs px-2 py-1 rounded-md border ${darkMode ? 'bg-blue-900/30 border-blue-800 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                    Найдено: <b>{filteredData.length}</b> | <b>{totalAmount.toLocaleString()} ₽</b>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span>На странице:</span>
              <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className={`p-1 rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={-1}>Все</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`font-medium ${darkMode ? 'bg-gray-900 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                <tr>
                  <th onClick={() => handleSort('date')} className="px-4 py-3 cursor-pointer hover:text-blue-500 select-none flex items-center gap-1">
                    Дата <SortIcon up={sortKey === 'date' && sortDir === 'asc'} />
                  </th>
                  <th className="px-4 py-3">Категория</th>
                  <th className="px-4 py-3">Описание</th>
                  <th onClick={() => handleSort('amount')} className="px-4 py-3 text-right cursor-pointer hover:text-blue-500 select-none">
                    <div className="flex items-center justify-end gap-1">Сумма <SortIcon up={sortKey === 'amount' && sortDir === 'asc'} /></div>
                  </th>
                  <th className="px-4 py-3 text-center"></th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {paginatedData.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center opacity-50">Нет данных</td></tr>
                ) : (
                  paginatedData.map((t) => (
                    <tr key={t.id} className={`transition-colors group ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${editingId === t.id ? (darkMode ? 'bg-blue-900/30' : 'bg-blue-50') : ''}`}>
                      <td className="px-4 py-3 font-medium opacity-90">{new Date(t.date).toLocaleDateString('ru-RU')}</td>
                      <td className="px-4 py-3">
                        {/* ЦВЕТ БЕЙДЖА КАТЕГОРИИ */}
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          appMode === 'income'
                            ? (darkMode ? 'bg-green-900/50 text-green-200' : 'bg-green-50 text-green-700')
                            : (darkMode ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-50 text-blue-700')
                        }`}>
                          {t.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 truncate max-w-xs opacity-80">{t.description || '-'}</td>
                      <td className="px-4 py-3 text-right font-bold">{t.amount.toLocaleString('ru-RU')} ₽</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => handleEdit(t)} className="opacity-50 hover:opacity-100 p-1 text-blue-500"><EditIcon /></button>
                          <button onClick={() => handleDelete(t.id)} className="opacity-50 hover:opacity-100 p-1 text-red-500"><TrashIcon /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {itemsPerPage !== -1 && totalPages > 1 && (
            <div className={`p-3 flex justify-center gap-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 rounded border disabled:opacity-30">Назад</button>
              <span className="px-2 py-1 opacity-70">Стр {currentPage} из {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 rounded border disabled:opacity-30">Вперед</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;