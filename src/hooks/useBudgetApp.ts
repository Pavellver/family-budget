import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  APP_VERSION,
  AppMode,
  CategoryKind,
  ClearMode,
  IMPORT_CATEGORY_GROUPS,
  PERIOD_LABELS,
  PeriodMode,
  SortDirection,
  SortKey,
  getEntryTypeByMode,
  getPlaceFieldLabel,
  getThemeColor,
} from '../app/config';
import { createPresetTransactions } from '../data/presetTransactions';
import {
  DEFAULT_CATEGORY_SETTINGS,
  DEFAULT_PAYMENT_METHODS,
  clearData,
  exportData,
  exportToExcel,
  importData,
  importFromExcel,
  loadCategorySettings,
  loadPaymentMethods,
  loadTransactions,
  normalizeCategorySettings,
  normalizePaymentMethods,
  saveCategorySettings,
  savePaymentMethods,
  saveTransactions,
} from '../services/storageService';
import { CategoryGroups, CategorySettings, Transaction, TransactionType, getAllCategories } from '../types';
import { getCurrentMonthDateRange, getPreviousMonthDateRange, getTodayDateInput, parseDateInput, shiftDays, toDateInputValue } from '../utils/date';
import { mergeTransactions } from '../utils/transactions';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const getFirstCategory = (groups: CategoryGroups): string => getAllCategories(groups)[0] || '';

const addUnknownCategoriesToGroups = (groups: CategoryGroups, categories: string[], importGroup: string): CategoryGroups => {
  const existing = new Set(
    Object.values(groups)
      .flat()
      .map(categoryName => categoryName.toLocaleLowerCase('ru-RU'))
  );
  const unknown = categories.reduce<string[]>((result, rawCategory) => {
    const categoryName = rawCategory.trim();
    const key = categoryName.toLocaleLowerCase('ru-RU');
    if (!categoryName || existing.has(key)) return result;

    existing.add(key);
    result.push(categoryName);
    return result;
  }, []);

  if (unknown.length === 0) return groups;

  return {
    ...groups,
    [importGroup]: [...(groups[importGroup] || []), ...unknown],
  };
};

const getCategorySettingsKey = (kind: CategoryKind) => kind === 'income' ? 'incomeGroups' : 'expenseGroups';

export const useBudgetApp = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [appMode, setAppMode] = useState<AppMode>('expenses');
  const [categorySettings, setCategorySettings] = useState<CategorySettings>(() => loadCategorySettings());

  const currentCategoryGroups = appMode === 'income' ? categorySettings.incomeGroups : categorySettings.expenseGroups;
  const currentAllCategories = useMemo(() => {
    const configuredCategories = getAllCategories(currentCategoryGroups);
    if (appMode !== 'expenses' && appMode !== 'income') return configuredCategories;

    const requiredType = getEntryTypeByMode(appMode);
    const transactionCategories = transactions
      .filter(t => t.type === requiredType)
      .map(t => t.category);

    return Array.from(new Set([...configuredCategories, ...transactionCategories]));
  }, [appMode, currentCategoryGroups, transactions]);
  const currentAllCategoryKey = currentAllCategories.join('\u0001');

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayDateInput());
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [store, setStore] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<string[]>(() => loadPaymentMethods());
  const [paymentMethod, setPaymentMethod] = useState(DEFAULT_PAYMENT_METHODS[0]);
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const formRef = useRef<HTMLElement>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showClearMenu, setShowClearMenu] = useState(false);
  const [periodMode, setPeriodMode] = useState<PeriodMode>('currentMonth');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => new Set(getAllCategories(categorySettings.expenseGroups)));
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const periodMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (appMode === 'analysis' || appMode === 'management') return;

    setCategory(prev => currentAllCategories.includes(prev) ? prev : getFirstCategory(currentCategoryGroups));
    setSelectedCategories(new Set(currentAllCategories));
    setCurrentPage(1);
  }, [appMode, currentAllCategoryKey, currentCategoryGroups]);

  useEffect(() => { saveTransactions(transactions); }, [transactions]);
  useEffect(() => { saveCategorySettings(categorySettings); }, [categorySettings]);
  useEffect(() => { savePaymentMethods(paymentMethods); }, [paymentMethods]);

  useEffect(() => {
    if (!paymentMethods.includes(paymentMethod)) {
      setPaymentMethod(paymentMethods[0] || DEFAULT_PAYMENT_METHODS[0]);
    }
  }, [paymentMethod, paymentMethods]);

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (periodMenuRef.current && !periodMenuRef.current.contains(event.target as Node)) {
        setShowPeriodMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setStore('');
  };

  const adjustAmount = (delta: number) => {
    const val = parseFloat(amount) || 0;
    const newVal = Math.max(0, val + delta);
    setAmount(Number(newVal.toFixed(2)).toString());
  };

  const handleAmountKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      adjustAmount(100);
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      adjustAmount(-100);
    }
  };

  const addPaymentMethod = () => {
    const method = newPaymentMethod.trim();
    if (!method) return;

    const nextPaymentMethods = normalizePaymentMethods([...paymentMethods, method]);
    const savedMethod = nextPaymentMethods.find(item => item.toLocaleLowerCase('ru-RU') === method.toLocaleLowerCase('ru-RU')) || method;
    setPaymentMethods(nextPaymentMethods);
    setPaymentMethod(savedMethod);
    setNewPaymentMethod('');
  };

  const removePaymentMethod = (method: string) => {
    setPaymentMethods(prev => {
      const next = prev.filter(item => item !== method);
      return next.length ? next : [...DEFAULT_PAYMENT_METHODS];
    });
  };

  const renamePaymentMethod = (oldMethod: string, rawMethod: string) => {
    const method = rawMethod.trim();
    if (!method || method === oldMethod) return;

    setPaymentMethods(prev => {
      const exists = prev.some(item => item !== oldMethod && item.toLocaleLowerCase('ru-RU') === method.toLocaleLowerCase('ru-RU'));
      if (exists) return prev;
      return prev.map(item => item === oldMethod ? method : item);
    });
    setTransactions(prev => prev.map(t => t.paymentMethod === oldMethod ? { ...t, paymentMethod: method } : t));
    setPaymentMethod(current => current === oldMethod ? method : current);
  };

  const resetPaymentMethods = () => {
    setPaymentMethods([...DEFAULT_PAYMENT_METHODS]);
    setPaymentMethod(DEFAULT_PAYMENT_METHODS[0]);
    setNewPaymentMethod('');
  };

  const includePaymentMethodsFromTransactions = (items: Transaction[]) => {
    const incomingMethods = items.map(t => t.paymentMethod).filter(Boolean);
    if (incomingMethods.length === 0) return;
    setPaymentMethods(prev => normalizePaymentMethods([...prev, ...incomingMethods]));
  };

  const includeImportedCategoriesFromTransactions = (items: Transaction[]) => {
    setCategorySettings(prev => normalizeCategorySettings({
      ...prev,
      expenseGroups: addUnknownCategoriesToGroups(
        prev.expenseGroups,
        items.filter(t => t.type === 'expense').map(t => t.category),
        IMPORT_CATEGORY_GROUPS.expense
      ),
      incomeGroups: addUnknownCategoriesToGroups(
        prev.incomeGroups,
        items.filter(t => t.type === 'income').map(t => t.category),
        IMPORT_CATEGORY_GROUPS.income
      ),
    }));
  };

  const updateCategoryGroups = (kind: CategoryKind, updater: (groups: CategoryGroups) => CategoryGroups) => {
    const key = getCategorySettingsKey(kind);
    setCategorySettings(prev => normalizeCategorySettings({
      ...prev,
      [key]: updater(prev[key]),
    }));
  };

  const addCategoryGroup = (kind: CategoryKind, rawGroup: string) => {
    const group = rawGroup.trim();
    if (!group) return;

    updateCategoryGroups(kind, groups => {
      const exists = Object.keys(groups).some(item => item.toLocaleLowerCase('ru-RU') === group.toLocaleLowerCase('ru-RU'));
      if (exists) return groups;
      return { ...groups, [group]: ['Новая категория'] };
    });
  };

  const renameCategoryGroup = (kind: CategoryKind, oldGroup: string, rawGroup: string) => {
    const group = rawGroup.trim();
    if (!group || group === oldGroup) return;

    updateCategoryGroups(kind, groups => {
      const exists = Object.keys(groups).some(item => item !== oldGroup && item.toLocaleLowerCase('ru-RU') === group.toLocaleLowerCase('ru-RU'));
      if (exists || !(oldGroup in groups)) return groups;
      return Object.fromEntries(Object.entries(groups).map(([name, items]) => [name === oldGroup ? group : name, items]));
    });
  };

  const removeCategoryGroup = (kind: CategoryKind, group: string) => {
    updateCategoryGroups(kind, groups => {
      if (!(group in groups) || Object.keys(groups).length <= 1) return groups;

      const next = { ...groups };
      delete next[group];
      return next;
    });
  };

  const addCategoryToGroup = (kind: CategoryKind, group: string, rawCategory: string) => {
    const categoryName = rawCategory.trim();
    if (!categoryName) return;

    updateCategoryGroups(kind, groups => {
      const items = groups[group];
      if (!items) return groups;

      const exists = items.some(item => item.toLocaleLowerCase('ru-RU') === categoryName.toLocaleLowerCase('ru-RU'));
      if (exists) return groups;

      return { ...groups, [group]: [...items, categoryName] };
    });
  };

  const renameCategory = (kind: CategoryKind, group: string, oldCategory: string, rawCategory: string) => {
    const categoryName = rawCategory.trim();
    if (!categoryName || categoryName === oldCategory) return;

    updateCategoryGroups(kind, groups => {
      const items = groups[group];
      if (!items) return groups;

      const exists = items.some(item => item !== oldCategory && item.toLocaleLowerCase('ru-RU') === categoryName.toLocaleLowerCase('ru-RU'));
      if (exists) return groups;

      return { ...groups, [group]: items.map(item => item === oldCategory ? categoryName : item) };
    });

    setTransactions(prev => prev.map(t => t.type === kind && t.category === oldCategory ? { ...t, category: categoryName } : t));
  };

  const removeCategory = (kind: CategoryKind, group: string, categoryName: string) => {
    updateCategoryGroups(kind, groups => {
      const items = groups[group];
      if (!items || items.length <= 1) return groups;

      return { ...groups, [group]: items.filter(item => item !== categoryName) };
    });
  };

  const resetCategories = (kind: CategoryKind) => {
    setCategorySettings(prev => {
      const key = getCategorySettingsKey(kind);
      const defaults = kind === 'income' ? DEFAULT_CATEGORY_SETTINGS.incomeGroups : DEFAULT_CATEGORY_SETTINGS.expenseGroups;
      return normalizeCategorySettings({ ...prev, [key]: defaults });
    });
  };

  const handleClearData = (mode: ClearMode) => {
    const msg = mode === 'all' ? 'Удалить ВСЕ данные?' : mode === 'income' ? 'Удалить все ДОХОДЫ?' : 'Удалить все РАСХОДЫ?';
    if (confirm(msg) && confirm('Точно? Это действие нельзя отменить.')) {
      const newData = clearData(mode);
      setTransactions(newData);
      setShowSettings(false);
      setShowClearMenu(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!amount || !date || !category) return;

    const year = parseDateInput(date).getFullYear();
    if (year < 2000 || year > 2099) {
      alert('Пожалуйста, укажите реальный год (2000 - 2099)');
      return;
    }

    const val = parseFloat(amount);
    if (val <= 0) {
      alert('Сумма должна быть больше нуля');
      return;
    }

    const type: TransactionType = getEntryTypeByMode(appMode);
    const cleanStore = store.trim();

    if (editingId) {
      setTransactions(prev => prev.map(t =>
        t.id === editingId ? { ...t, date, amount: val, category, description, store: cleanStore, paymentMethod, type } : t
      ));
      setEditingId(null);
    } else {
      setTransactions(prev => [{
        id: generateId(),
        date,
        amount: val,
        category,
        description,
        store: cleanStore,
        paymentMethod,
        type,
        createdAt: Date.now(),
      }, ...prev]);
    }

    resetForm();
  };

  const handleEdit = (transaction: Transaction) => {
    if (transaction.type === 'expense' && appMode !== 'expenses') setAppMode('expenses');
    if (transaction.type === 'income' && appMode !== 'income') setAppMode('income');

    setEditingId(transaction.id);
    setAmount(transaction.amount.toString());
    setDate(transaction.date);
    setCategory(transaction.category);
    setDescription(transaction.description);
    setStore(transaction.store || '');
    if (transaction.paymentMethod) {
      setPaymentMethods(prev => normalizePaymentMethods([...prev, transaction.paymentMethod]));
    }
    setPaymentMethod(transaction.paymentMethod || paymentMethods[0] || DEFAULT_PAYMENT_METHODS[0]);
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
    setPaymentMethod(paymentMethods[0] || DEFAULT_PAYMENT_METHODS[0]);
    setDate(getTodayDateInput());
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить запись?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      if (editingId === id) cancelEdit();
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filteredData = useMemo(() => {
    const now = new Date();
    let startStr = '';
    let endStr = '';

    switch (periodMode) {
      case 'currentMonth':
        ({ start: startStr, end: endStr } = getCurrentMonthDateRange(now));
        break;
      case 'prevMonth':
        ({ start: startStr, end: endStr } = getPreviousMonthDateRange(now));
        break;
      case 'last30days':
        startStr = toDateInputValue(shiftDays(now, -30));
        endStr = toDateInputValue(now);
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
        break;
    }

    return transactions
      .filter(t => {
        if (appMode !== 'analysis') {
          const requiredType = getEntryTypeByMode(appMode);
          if (t.type !== requiredType) return false;
        }

        if (periodMode !== 'all') {
          if (t.date < startStr || t.date > endStr) return false;
        }

        if (!selectedCategories.has(t.category)) return false;

        if (searchQuery) {
          const query = searchQuery.toLowerCase().trim();
          const searchableText = [t.description, t.store, t.paymentMethod, t.category]
            .join(' ')
            .toLowerCase();
          if (!searchableText.includes(query)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const valA = sortKey === 'amount' ? a.amount : parseDateInput(a.date).getTime();
        const valB = sortKey === 'amount' ? b.amount : parseDateInput(b.date).getTime();
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [appMode, customEnd, customStart, periodMode, searchQuery, selectedCategories, sortDir, sortKey, transactions]);

  const paginatedData = useMemo(() => {
    if (itemsPerPage === -1) return filteredData;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredData, itemsPerPage]);

  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(filteredData.length / itemsPerPage);
  const totalAmount = useMemo(() => filteredData.reduce((sum, t) => sum + t.amount, 0), [filteredData]);

  const toggleAllCategories = () => {
    if (selectedCategories.size === currentAllCategories.length) setSelectedCategories(new Set());
    else setSelectedCategories(new Set(currentAllCategories));
  };

  const toggleCategory = (categoryName: string) => {
    const nextSelectedCategories = new Set(selectedCategories);
    if (nextSelectedCategories.has(categoryName)) nextSelectedCategories.delete(categoryName);
    else nextSelectedCategories.add(categoryName);
    setSelectedCategories(nextSelectedCategories);
  };

  const handleLoadPresetData = () => {
    const message = transactions.length
      ? 'Загрузить демо-данные и заменить текущие записи?'
      : 'Загрузить демо-данные?';
    if (!confirm(message)) return;

    setTransactions(createPresetTransactions());
    setShowSettings(false);
    setShowClearMenu(false);
    setEditingId(null);
    resetForm();
    setPaymentMethod(paymentMethods[0] || DEFAULT_PAYMENT_METHODS[0]);
    setDate(getTodayDateInput());
  };

  const importWithMode = (incoming: Transaction[], importedSettings?: CategorySettings, importedPaymentMethods?: string[]) => {
    let imported = false;

    if (confirm('Заменить текущие данные импортом?')) {
      setTransactions(incoming);
      imported = true;
    } else if (confirm('Дополнить текущие данные импортом (без удаления существующих)?')) {
      setTransactions(prev => mergeTransactions(prev, incoming));
      imported = true;
    }

    if (!imported) return false;

    if (importedSettings) setCategorySettings(importedSettings);
    if (importedPaymentMethods) {
      setPaymentMethods(prev => normalizePaymentMethods([...prev, ...importedPaymentMethods]));
    }
    includePaymentMethodsFromTransactions(incoming);
    includeImportedCategoriesFromTransactions(incoming);
    return true;
  };

  const exportJson = () => {
    exportData(transactions, APP_VERSION, { categorySettings, paymentMethods });
  };

  const importJsonFile = (file: File) => {
    importData(file)
      .then(data => {
        importWithMode(data.transactions, data.categorySettings, data.paymentMethods);
      })
      .catch(() => {
        alert('Не удалось загрузить JSON: проверьте формат файла.');
      });
  };

  const exportExcel = () => {
    exportToExcel(transactions).catch(() => {
      alert('Не удалось подготовить Excel-файл.');
    });
  };

  const importExcelFile = (file: File) => {
    importFromExcel(file)
      .then(importWithMode)
      .catch(() => {
        alert('Не удалось загрузить Excel: проверьте структуру файла.');
      });
  };

  return {
    transactions,
    darkMode,
    appMode,
    setAppMode,
    categorySettings,
    currentCategoryGroups,
    currentAllCategories,
    amount,
    setAmount,
    date,
    setDate,
    category,
    setCategory,
    description,
    setDescription,
    store,
    setStore,
    paymentMethods,
    paymentMethod,
    setPaymentMethod,
    newPaymentMethod,
    setNewPaymentMethod,
    editingId,
    formRef,
    showSettings,
    setShowSettings,
    showClearMenu,
    setShowClearMenu,
    periodMode,
    setPeriodMode,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    showPeriodMenu,
    setShowPeriodMenu,
    selectedCategories,
    searchQuery,
    setSearchQuery,
    sortKey,
    sortDir,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    periodMenuRef,
    filteredData,
    paginatedData,
    totalPages,
    totalAmount,
    themeColor: getThemeColor(appMode),
    placeFieldLabel: getPlaceFieldLabel(appMode),
    periodLabel: PERIOD_LABELS[periodMode],
    setDarkMode,
    adjustAmount,
    handleAmountKeyDown,
    addPaymentMethod,
    removePaymentMethod,
    renamePaymentMethod,
    resetPaymentMethods,
    addCategoryGroup,
    renameCategoryGroup,
    removeCategoryGroup,
    addCategoryToGroup,
    renameCategory,
    removeCategory,
    resetCategories,
    handleClearData,
    handleSubmit,
    handleEdit,
    cancelEdit,
    handleDelete,
    handleSort,
    toggleAllCategories,
    toggleCategory,
    handleLoadPresetData,
    exportJson,
    importJsonFile,
    exportExcel,
    importExcelFile,
  };
};

export type BudgetAppState = ReturnType<typeof useBudgetApp>;
