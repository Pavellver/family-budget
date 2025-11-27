import { Transaction } from '../types';
import * as XLSX from 'xlsx';

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
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Load failed', error);
    return [];
  }
};

// --- JSON EXPORT/IMPORT ---
export const exportData = (transactions: Transaction[]) => {
  const dataStr = JSON.stringify(transactions, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `budget_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const importData = (file: File): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = JSON.parse(e.target?.result as string);
        if (Array.isArray(result)) resolve(result);
        else reject(new Error("Invalid format"));
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
};

// --- EXCEL EXPORT/IMPORT (НОВОЕ) ---

export const exportToExcel = (transactions: Transaction[]) => {
  // Подготовка данных (делаем красивые заголовки для Excel)
  const dataToExport = transactions.map(t => ({
    'Дата': t.date,
    'Категория': t.category,
    'Сумма': t.amount,
    'Описание': t.description,
    'ID (Не трогать)': t.id
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Расходы");
  
  // Настройка ширины колонок
  worksheet['!cols'] = [{wch: 12}, {wch: 15}, {wch: 10}, {wch: 30}, {wch: 25}];

  XLSX.writeFile(workbook, `budget_excel_${new Date().toISOString().split('T')[0]}.xlsx`);
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

        // Превращаем Excel-строки обратно в формат приложения
        const parsedTransactions: Transaction[] = jsonData.map((row: any) => ({
          id: row['ID (Не трогать)'] || crypto.randomUUID(), // Если ID нет, создадим новый
          date: row['Дата'] || new Date().toISOString().split('T')[0],
          amount: Number(row['Сумма']) || 0,
          category: row['Категория'] || 'Другое',
          description: row['Описание'] || '',
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