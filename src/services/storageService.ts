import { Transaction } from '../types';
import * as XLSX from 'xlsx';
import { getTodayDateInput, toDateInputValue } from '../utils/date';

const STORAGE_KEY = 'budget_transactions';

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
    
    return parsed.map((t: any) => ({
      ...t,
      date: normalizeImportedDate(t.date),
      type: t.type || 'expense' 
    }));
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

export const exportData = (transactions: Transaction[], version: string) => {
  const backup = {
    version: version,
    createdAt: new Date().toISOString(),
    transactions: transactions
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

export const importData = (file: File): Promise<Transaction[]> => {
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

        const cleanData = dataToImport.map((t: any) => ({
          ...t,
          date: normalizeImportedDate(t.date),
          type: t.type || 'expense'
        }));
        
        resolve(cleanData);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
};

export const exportToExcel = (transactions: Transaction[]) => {
  const dataToExport = transactions.map(t => ({
    'Тип': t.type === 'expense' ? 'Расход' : 'Доход',
    'Дата': t.date,
    'Категория': t.category,
    'Сумма': t.amount,
    'Описание': t.description,
    'ID (Не трогать)': t.id
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Бюджет");
  worksheet['!cols'] = [{wch: 10}, {wch: 12}, {wch: 20}, {wch: 10}, {wch: 30}, {wch: 25}];
  XLSX.writeFile(workbook, `budget_excel_${getTodayDateInput()}.xlsx`);
};

const normalizeImportedDate = (rawDate: unknown): string => {
  if (typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    return rawDate;
  }

  if (rawDate instanceof Date && !Number.isNaN(rawDate.getTime())) {
    return toDateInputValue(rawDate);
  }

  if (typeof rawDate === 'number') {
    const parsed = XLSX.SSF.parse_date_code(rawDate);
    if (parsed) {
      return toDateInputValue(new Date(parsed.y, parsed.m - 1, parsed.d));
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
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const parsedTransactions: Transaction[] = jsonData.map((row: any) => ({
          id: row['ID (Не трогать)'] || crypto.randomUUID(),
          date: normalizeImportedDate(row['Дата']),
          amount: Number(row['Сумма']) || 0,
          category: row['Категория'] || 'Другое',
          description: row['Описание'] || '',
          type: (row['Тип'] === 'Доход') ? 'income' : 'expense', 
          createdAt: Date.now()
        }));

        resolve(parsedTransactions);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};
