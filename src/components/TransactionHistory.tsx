import React from 'react';
import { getMissingPlaceText } from '../app/config';
import { BudgetAppState } from '../hooks/useBudgetApp';
import { parseDateInput } from '../utils/date';
import { EditIcon, FirstPageIcon, LastPageIcon, SearchIcon, SortIcon, TrashIcon } from './icons';

interface TransactionHistoryProps {
  budget: BudgetAppState;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ budget }) => {
  const {
    appMode,
    darkMode,
    sortKey,
    sortDir,
    searchQuery,
    itemsPerPage,
    currentPage,
    totalPages,
    totalAmount,
    filteredData,
    paginatedData,
    transactions,
    editingId,
    placeFieldLabel,
    setSearchQuery,
    setCurrentPage,
    setItemsPerPage,
    handleSort,
    handleEdit,
    handleDelete,
  } = budget;

  const categoryClass = appMode === 'income'
    ? (darkMode ? 'bg-green-900/50 text-green-200' : 'bg-green-50 text-green-700')
    : (darkMode ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-50 text-blue-700');

  return (
    <section className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
      <div className={`p-4 border-b flex flex-wrap gap-4 justify-between items-center ${darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50/50 border-gray-100'}`}>
        <div className="flex items-center gap-4">
          <h3 className="font-semibold">История</h3>

          <div className="flex items-center gap-2">
            <div className={`flex items-center px-2 py-1 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
              <span className="opacity-50 mr-1"><SearchIcon /></span>
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent outline-none text-sm w-40 md:w-48 placeholder-gray-400"
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
          <select
            value={itemsPerPage}
            onChange={(event) => {
              setItemsPerPage(Number(event.target.value));
              setCurrentPage(1);
            }}
            className={`p-1 rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={-1}>Все</option>
          </select>
        </div>

        <div className="md:hidden flex items-center gap-2 text-xs">
          <button type="button" onClick={() => handleSort('date')} className={`px-2 py-1 rounded border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
            Дата
          </button>
          <button type="button" onClick={() => handleSort('amount')} className={`px-2 py-1 rounded border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
            Сумма
          </button>
        </div>
      </div>

      <div className="md:hidden p-3 space-y-2">
        {paginatedData.length === 0 ? (
          <div className="px-4 py-8 text-center opacity-50">Нет данных</div>
        ) : (
          paginatedData.map((transaction) => (
            <article key={transaction.id} className={`rounded-lg border px-2.5 py-2 ${darkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-gray-50/70'}`}>
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] opacity-60 whitespace-nowrap">{parseDateInput(transaction.date).toLocaleDateString('ru-RU')}</span>
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${categoryClass}`}>
                      {transaction.category}
                    </span>
                    <span className="truncate text-xs opacity-80">{transaction.description || '-'}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] opacity-60">
                    <span>{transaction.store || getMissingPlaceText(appMode)}</span>
                    <span>{transaction.paymentMethod || 'Оплата не указана'}</span>
                  </div>
                </div>
                <div className="font-semibold text-sm whitespace-nowrap">{transaction.amount.toLocaleString('ru-RU')} ₽</div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleEdit(transaction)}
                    aria-label="Редактировать запись"
                    title="Редактировать"
                    className={`h-9 w-9 rounded-md border flex items-center justify-center text-blue-500 ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}
                  >
                    <EditIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(transaction.id)}
                    aria-label="Удалить запись"
                    title="Удалить"
                    className={`h-9 w-9 rounded-md border flex items-center justify-center text-red-500 ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className={`font-medium ${darkMode ? 'bg-gray-900 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
            <tr>
              <th onClick={() => handleSort('date')} className="px-4 py-3 cursor-pointer hover:text-blue-500 select-none flex items-center gap-1">
                Дата <SortIcon up={sortKey === 'date' && sortDir === 'asc'} />
              </th>
              <th className="px-4 py-3">Категория</th>
              <th className="px-4 py-3">{placeFieldLabel}</th>
              <th className="px-4 py-3">Оплата</th>
              <th className="px-4 py-3">Описание</th>
              <th onClick={() => handleSort('amount')} className="px-4 py-3 text-right cursor-pointer hover:text-blue-500 select-none">
                <div className="flex items-center justify-end gap-1">Сумма <SortIcon up={sortKey === 'amount' && sortDir === 'asc'} /></div>
              </th>
              <th className="px-4 py-3 text-center"></th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {paginatedData.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center opacity-50">Нет данных</td></tr>
            ) : (
              paginatedData.map((transaction) => (
                <tr key={transaction.id} className={`transition-colors group ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${editingId === transaction.id ? (darkMode ? 'bg-blue-900/30' : 'bg-blue-50') : ''}`}>
                  <td className="px-4 py-3 font-medium opacity-90">{parseDateInput(transaction.date).toLocaleDateString('ru-RU')}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${categoryClass}`}>
                      {transaction.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 truncate max-w-[9rem] opacity-80">{transaction.store || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                      {transaction.paymentMethod || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 truncate max-w-xs opacity-80">{transaction.description || '-'}</td>
                  <td className="px-4 py-3 text-right font-bold">{transaction.amount.toLocaleString('ru-RU')} ₽</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button type="button" onClick={() => handleEdit(transaction)} className="opacity-50 hover:opacity-100 p-1 text-blue-500"><EditIcon /></button>
                      <button type="button" onClick={() => handleDelete(transaction.id)} className="opacity-50 hover:opacity-100 p-1 text-red-500"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {itemsPerPage !== -1 && totalPages > 1 && (
        <div className={`hidden md:flex p-3 justify-center gap-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="px-2 py-1 rounded border disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><FirstPageIcon /></button>
          <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="px-3 py-1 rounded border disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Назад</button>
          <span className="px-2 py-1 opacity-70">Стр {currentPage} из {totalPages}</span>
          <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="px-3 py-1 rounded border disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Вперед</button>
          <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} className="px-2 py-1 rounded border disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><LastPageIcon /></button>
        </div>
      )}

      {itemsPerPage !== -1 && totalPages > 1 && (
        <div className={`md:hidden p-3 flex justify-between items-center border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="h-9 px-3 rounded border disabled:opacity-30">Назад</button>
          <span className="text-xs opacity-70">Стр {currentPage} / {totalPages}</span>
          <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="h-9 px-3 rounded border disabled:opacity-30">Вперед</button>
        </div>
      )}
    </section>
  );
};
