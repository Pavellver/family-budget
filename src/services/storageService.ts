import { CategoryGroups, CategorySettings, EXPENSE_GROUPS, INCOME_GROUPS, Transaction } from '../types';
import { getTodayDateInput, toDateInputValue } from '../utils/date';

const STORAGE_KEY = 'budget_transactions';
const PAYMENT_METHODS_KEY = 'budget_payment_methods';
const CATEGORY_SETTINGS_KEY = 'budget_category_settings';

export const DEFAULT_PAYMENT_METHODS = ['ВТБ', 'Озон', 'Т', 'нал'];

const cloneCategoryGroups = (groups: CategoryGroups): CategoryGroups =>
  Object.fromEntries(Object.entries(groups).map(([group, items]) => [group, [...items]]));

export const DEFAULT_CATEGORY_SETTINGS: CategorySettings = {
  expenseGroups: cloneCategoryGroups(EXPENSE_GROUPS),
  incomeGroups: cloneCategoryGroups(INCOME_GROUPS),
};

export interface ImportedBudgetData {
  transactions: Transaction[];
  categorySettings?: CategorySettings;
  paymentMethods?: string[];
}

export const normalizePaymentMethods = (rawMethods: unknown): string[] => {
  if (!Array.isArray(rawMethods)) return [...DEFAULT_PAYMENT_METHODS];

  const seen = new Set<string>();
  const normalized = rawMethods.reduce<string[]>((methods, rawMethod) => {
    if (typeof rawMethod !== 'string') return methods;

    const method = rawMethod.trim();
    const key = method.toLocaleLowerCase('ru-RU');
    if (!method || seen.has(key)) return methods;

    seen.add(key);
    methods.push(method);
    return methods;
  }, []);

  return normalized.length ? normalized : [...DEFAULT_PAYMENT_METHODS];
};

export const loadPaymentMethods = (): string[] => {
  try {
    const data = localStorage.getItem(PAYMENT_METHODS_KEY);
    if (!data) return [...DEFAULT_PAYMENT_METHODS];
    return normalizePaymentMethods(JSON.parse(data));
  } catch (error) {
    console.error('Payment methods load failed', error);
    return [...DEFAULT_PAYMENT_METHODS];
  }
};

export const savePaymentMethods = (paymentMethods: string[]) => {
  try {
    localStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(normalizePaymentMethods(paymentMethods)));
  } catch (error) {
    console.error('Payment methods save failed', error);
  }
};

export const normalizeCategoryGroups = (rawGroups: unknown, fallbackGroups: CategoryGroups): CategoryGroups => {
  if (!rawGroups || typeof rawGroups !== 'object' || Array.isArray(rawGroups)) {
    return cloneCategoryGroups(fallbackGroups);
  }

  const groups: CategoryGroups = {};
  const seenGroups = new Set<string>();

  Object.entries(rawGroups as Record<string, unknown>).forEach(([rawGroup, rawItems]) => {
    const group = rawGroup.trim();
    const groupKey = group.toLocaleLowerCase('ru-RU');
    if (!group || seenGroups.has(groupKey) || !Array.isArray(rawItems)) return;

    const seenItems = new Set<string>();
    const items = rawItems.reduce<string[]>((normalizedItems, rawItem) => {
      if (typeof rawItem !== 'string') return normalizedItems;

      const item = rawItem.trim();
      const itemKey = item.toLocaleLowerCase('ru-RU');
      if (!item || seenItems.has(itemKey)) return normalizedItems;

      seenItems.add(itemKey);
      normalizedItems.push(item);
      return normalizedItems;
    }, []);

    if (items.length > 0) {
      seenGroups.add(groupKey);
      groups[group] = items;
    }
  });

  return Object.keys(groups).length ? groups : cloneCategoryGroups(fallbackGroups);
};

export const normalizeCategorySettings = (rawSettings: unknown): CategorySettings => {
  const source = rawSettings && typeof rawSettings === 'object' ? rawSettings as Record<string, unknown> : {};

  return {
    expenseGroups: normalizeCategoryGroups(source.expenseGroups, EXPENSE_GROUPS),
    incomeGroups: normalizeCategoryGroups(source.incomeGroups, INCOME_GROUPS),
  };
};

export const loadCategorySettings = (): CategorySettings => {
  try {
    const data = localStorage.getItem(CATEGORY_SETTINGS_KEY);
    if (!data) return normalizeCategorySettings(DEFAULT_CATEGORY_SETTINGS);
    return normalizeCategorySettings(JSON.parse(data));
  } catch (error) {
    console.error('Category settings load failed', error);
    return normalizeCategorySettings(DEFAULT_CATEGORY_SETTINGS);
  }
};

export const saveCategorySettings = (settings: CategorySettings) => {
  try {
    localStorage.setItem(CATEGORY_SETTINGS_KEY, JSON.stringify(normalizeCategorySettings(settings)));
  } catch (error) {
    console.error('Category settings save failed', error);
  }
};

const normalizeTransaction = (raw: any, parseExcelDate?: (value: number) => Date | null): Transaction => ({
  id: typeof raw?.id === 'string' && raw.id ? raw.id : `tx_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  date: normalizeImportedDate(raw?.date, parseExcelDate),
  amount: Number(raw?.amount) || 0,
  category: typeof raw?.category === 'string' && raw.category ? raw.category : 'Другое',
  description: typeof raw?.description === 'string' ? raw.description : '',
  store: typeof raw?.store === 'string' ? raw.store : '',
  paymentMethod: typeof raw?.paymentMethod === 'string' ? raw.paymentMethod.trim() : '',
  type: raw?.type === 'income' ? 'income' : 'expense',
  createdAt: Number(raw?.createdAt) || Date.now(),
});

export const saveTransactions = (transactions: Transaction[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Save failed', error);
  }
};

export const loadTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    
    return parsed.map((t: any) => normalizeTransaction(t));
  } catch (error) {
    console.error('Load failed', error);
    return [];
  }
};

export const clearData = (mode: 'all' | 'income' | 'expenses') => {
  if (mode === 'all') {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }

  const current = loadTransactions();
  let filtered: Transaction[] = [];

  if (mode === 'income') {
    filtered = current.filter(t => t.type === 'expense');
  } else if (mode === 'expenses') {
    filtered = current.filter(t => t.type === 'income');
  }

  saveTransactions(filtered);
  return filtered;
};

export const exportData = (
  transactions: Transaction[],
  version: string,
  settings?: { categorySettings?: CategorySettings; paymentMethods?: string[] }
) => {
  const backup = {
    version: version,
    createdAt: new Date().toISOString(),
    transactions: transactions,
    categorySettings: settings?.categorySettings ? normalizeCategorySettings(settings.categorySettings) : undefined,
    paymentMethods: settings?.paymentMethods ? normalizePaymentMethods(settings.paymentMethods) : undefined,
  };

  const dataStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `budget_backup_v${version}_${getTodayDateInput()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importData = (file: File): Promise<ImportedBudgetData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = JSON.parse(e.target?.result as string);
        
        let dataToImport: any[] = [];

        if (result.transactions && Array.isArray(result.transactions)) {
          dataToImport = result.transactions;
        } else if (Array.isArray(result)) {
          dataToImport = result;
        } else {
          throw new Error("Неверный формат файла");
        }

        const cleanData = dataToImport.map((t: any) => normalizeTransaction(t));
        
        resolve({
          transactions: cleanData,
          categorySettings: result.categorySettings ? normalizeCategorySettings(result.categorySettings) : undefined,
          paymentMethods: result.paymentMethods ? normalizePaymentMethods(result.paymentMethods) : undefined,
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
};

export const exportToExcel = async (transactions: Transaction[]) => {
  const XLSX = await import('xlsx');
  const dataToExport = transactions.map(t => ({
    'Тип': t.type === 'expense' ? 'Расход' : 'Доход',
    'Дата': t.date,
    'Категория': t.category,
    'Место / источник': t.store,
    'Способ оплаты': t.paymentMethod,
    'Сумма': t.amount,
    'Описание': t.description,
    'ID (Не трогать)': t.id
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Бюджет");
  worksheet['!cols'] = [{wch: 10}, {wch: 12}, {wch: 20}, {wch: 22}, {wch: 16}, {wch: 10}, {wch: 30}, {wch: 25}];
  XLSX.writeFile(workbook, `budget_excel_${getTodayDateInput()}.xlsx`);
};

const normalizeImportedDate = (rawDate: unknown, parseExcelDate?: (value: number) => Date | null): string => {
  if (typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    return rawDate;
  }

  if (rawDate instanceof Date && !Number.isNaN(rawDate.getTime())) {
    return toDateInputValue(rawDate);
  }

  if (typeof rawDate === 'number') {
    const parsed = parseExcelDate?.(rawDate);
    if (parsed) {
      return toDateInputValue(parsed);
    }
  }

  if (typeof rawDate === 'string') {
    const parsed = new Date(rawDate);
    if (!Number.isNaN(parsed.getTime())) {
      return toDateInputValue(parsed);
    }
  }

  return getTodayDateInput();
};

export const importFromExcel = (file: File): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const XLSX = await import('xlsx');
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const parseExcelDate = (value: number) => {
          const parsed = XLSX.SSF.parse_date_code(value);
          return parsed ? new Date(parsed.y, parsed.m - 1, parsed.d) : null;
        };

        const parsedTransactions: Transaction[] = jsonData.map((row: any) => normalizeTransaction({
          id: row['ID (Не трогать)'] || crypto.randomUUID(),
          date: row['Дата'],
          amount: row['Сумма'],
          category: row['Категория'],
          description: row['Описание'],
          store: row['Место / источник'] || row['Место/Источник'] || row['Магазин'] || row['Источник'],
          paymentMethod: row['Способ оплаты'],
          type: (row['Тип'] === 'Доход') ? 'income' : 'expense', 
          createdAt: Date.now()
        }, parseExcelDate));

        resolve(parsedTransactions);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};
