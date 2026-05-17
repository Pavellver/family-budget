import React from 'react';
import { PERIOD_OPTIONS } from '../app/config';
import { BudgetAppState } from '../hooks/useBudgetApp';
import { StatsChart } from './StatsChart';
import { ChevronDownIcon, FilterIcon } from './icons';

interface BudgetOverviewProps {
  budget: BudgetAppState;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budget }) => {
  const {
    appMode,
    darkMode,
    themeColor,
    periodMode,
    periodLabel,
    customStart,
    customEnd,
    showPeriodMenu,
    currentAllCategories,
    currentCategoryGroups,
    selectedCategories,
    filteredData,
    totalAmount,
    periodMenuRef,
    setPeriodMode,
    setCustomStart,
    setCustomEnd,
    setShowPeriodMenu,
    toggleAllCategories,
    toggleCategory,
  } = budget;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-4">
        <div className={`rounded-xl shadow-md p-6 relative ${appMode === 'income' ? 'bg-gradient-to-br from-green-600 to-green-800' : 'bg-gradient-to-br from-blue-600 to-blue-800'} text-white`}>
          <div className="flex justify-between items-center mb-4 relative" ref={periodMenuRef}>
            <h3 className="font-medium text-white/90">{appMode === 'income' ? 'Доходы:' : 'Расходы:'}</h3>
            <button
              type="button"
              onClick={() => setShowPeriodMenu(!showPeriodMenu)}
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              {periodLabel} <ChevronDownIcon />
            </button>
            {showPeriodMenu && (
              <div className={`absolute right-0 top-full mt-2 w-64 rounded-xl shadow-xl border z-30 p-2 ${darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-100 text-gray-800'}`}>
                {PERIOD_OPTIONS.map(({ mode, label }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setPeriodMode(mode);
                      setShowPeriodMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${periodMode === mode ? `bg-${themeColor}-600 text-white` : 'hover:bg-opacity-10 hover:bg-gray-500'}`}
                  >
                    {label}
                  </button>
                ))}
                <div className={`border-t my-1 pt-1 ${darkMode ? 'border-gray-600' : 'border-gray-100'}`}>
                  <div className="px-3 py-1 text-xs opacity-50 font-medium uppercase">Свой период</div>
                  <div className="p-2 space-y-2">
                    <input
                      type="date"
                      value={customStart}
                      onChange={(event) => setCustomStart(event.target.value)}
                      className={`w-full text-sm p-1 border rounded outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                    />
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(event) => setCustomEnd(event.target.value)}
                      className={`w-full text-sm p-1 border rounded outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customStart && customEnd) {
                          setPeriodMode('custom');
                          setShowPeriodMenu(false);
                        }
                      }}
                      className={`w-full text-white text-sm py-1 rounded ${appMode === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      Применить
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <p className="text-4xl font-bold tracking-tight break-words">{totalAmount.toLocaleString('ru-RU')} ₽</p>
          <p className="mt-2 text-sm text-white/80">Записей: {filteredData.length}</p>
        </div>

        <div className={`rounded-xl shadow-sm border p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold opacity-50 uppercase tracking-wider flex items-center gap-1">
              <FilterIcon /> Категории
            </h3>
            <button
              type="button"
              onClick={toggleAllCategories}
              className={`text-xs font-medium hover:underline ${appMode === 'income' ? 'text-green-500' : 'text-blue-500'}`}
            >
              {selectedCategories.size === currentAllCategories.length ? 'Сбросить' : 'Выбрать все'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentAllCategories.map((cat) => {
              const isSelected = selectedCategories.has(cat);
              const activeClass = appMode === 'income'
                ? (darkMode ? 'bg-green-900 border-green-800 text-green-200' : 'bg-green-50 border-green-200 text-green-700')
                : (darkMode ? 'bg-blue-900 border-blue-800 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-700');
              const inactiveClass = darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-white border-gray-200 text-gray-400';

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${isSelected ? activeClass : inactiveClass}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="md:col-span-2 space-y-4">
        <StatsChart transactions={filteredData} categoryGroups={currentCategoryGroups} darkMode={darkMode} />
      </div>
    </div>
  );
};
