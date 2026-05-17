import React from 'react';
import { APP_VERSION, AppMode, ClearMode } from '../app/config';
import { BudgetAppState } from '../hooks/useBudgetApp';
import { Button } from './ui/Button';
import { DownloadIcon, ExcelIcon, MoonIcon, SunIcon, Trash2Icon, UploadIcon } from './icons';

interface AppHeaderProps {
  budget: BudgetAppState;
}

const navItems: Array<{ mode: AppMode; label: string; activeClass: string }> = [
  { mode: 'expenses', label: 'Расходы', activeClass: 'bg-white text-blue-600 shadow-sm font-medium' },
  { mode: 'income', label: 'Доходы', activeClass: 'bg-white text-green-600 shadow-sm font-medium' },
  { mode: 'analysis', label: 'Анализ', activeClass: 'bg-white text-purple-600 shadow-sm font-medium' },
  { mode: 'management', label: 'Управление', activeClass: 'bg-white text-gray-900 shadow-sm font-medium' },
];

export const AppHeader: React.FC<AppHeaderProps> = ({ budget }) => {
  const {
    appMode,
    darkMode,
    showSettings,
    showClearMenu,
    transactions,
    setAppMode,
    setDarkMode,
    setShowSettings,
    setShowClearMenu,
    exportJson,
    importJsonFile,
    exportExcel,
    importExcelFile,
    handleLoadPresetData,
    handleClearData,
  } = budget;

  const navInactiveClass = darkMode
    ? 'text-gray-300 hover:text-white hover:bg-gray-600/60'
    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50';

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>, onFile: (file: File) => void) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onFile(file);
  };

  const clearButtons: Array<{ mode: ClearMode; label: string; className?: string }> = [
    { mode: 'income', label: 'Только Доходы' },
    { mode: 'expenses', label: 'Только Расходы' },
    { mode: 'all', label: 'Удалить ВСЁ', className: 'bg-red-700 hover:bg-red-800' },
  ];

  return (
    <header className={`sticky top-0 z-20 shadow-sm transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white'}`}>
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap gap-3 justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Семейный Бюджет</h1>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Контроль финансов</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <div className={`flex w-full sm:w-auto rounded-lg p-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            {navItems.map((item) => (
              <button
                key={item.mode}
                type="button"
                onClick={() => setAppMode(item.mode)}
                className={`flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm rounded-md transition-all ${
                  appMode === item.mode ? item.activeClass : navInactiveClass
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`h-10 w-10 flex items-center justify-center rounded-full transition-colors ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-100 text-gray-600'}`}
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`h-10 px-3 text-sm rounded-lg border transition-colors ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`}
          >
            Меню
          </button>
        </div>
      </div>

      {showSettings && (
        <div className={`p-4 border-b animate-in slide-in-from-top-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
          <div className="max-w-5xl mx-auto flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-2">
                <Button
                  onClick={exportJson}
                  variant="outline"
                  className={`text-xs text-purple-600 border-purple-200 ${darkMode ? 'bg-purple-900/20 border-purple-800 text-purple-400' : ''}`}
                >
                  <DownloadIcon /> JSON
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(event) => handleFile(event, importJsonFile)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" className={`text-xs text-purple-600 border-purple-200 ${darkMode ? 'bg-purple-900/20 border-purple-800 text-purple-400' : ''}`}>
                    <UploadIcon /> JSON
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 border-l pl-3 border-gray-400/30">
                <Button
                  onClick={exportExcel}
                  variant="outline"
                  className={`text-xs font-semibold text-green-700 border-green-300 ${darkMode ? 'bg-green-900/20 border-green-800 text-green-400' : ''}`}
                >
                  <ExcelIcon /> Excel Скачать
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={(event) => handleFile(event, importExcelFile)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" className={`text-xs font-semibold text-green-700 border-green-300 ${darkMode ? 'bg-green-900/20 border-green-800 text-green-400' : ''}`}>
                    <UploadIcon /> Excel Загрузить
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 border-l pl-3 border-gray-400/30">
                <Button
                  onClick={handleLoadPresetData}
                  variant="primary"
                  className={`text-xs font-semibold ${darkMode ? 'bg-amber-400 hover:bg-amber-300 text-gray-900' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
                >
                  Загрузить демо-данные
                </Button>
              </div>

              <div className="ml-auto w-full sm:w-auto">
                <button type="button" onClick={() => setShowClearMenu(!showClearMenu)} className="text-xs text-red-500 hover:underline">
                  Очистка данных
                </button>
              </div>
            </div>

            {showClearMenu && (
              <div className={`p-3 rounded border border-red-200 flex flex-wrap gap-2 items-center ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                <span className="text-xs font-bold text-red-500 uppercase mr-2">Удаление:</span>
                {clearButtons.map((item) => (
                  <Button
                    key={item.mode}
                    onClick={() => handleClearData(item.mode)}
                    variant="danger"
                    className={`text-xs px-2 py-1 h-8 ${item.className || ''}`}
                  >
                    {item.mode === 'all' && <Trash2Icon />} {item.label}
                  </Button>
                ))}
              </div>
            )}

            <div className="text-xs opacity-50 text-right">Всего записей: {transactions.length} | v{APP_VERSION}</div>
          </div>
        </div>
      )}
    </header>
  );
};
