import React from 'react';
import { getPlaceFieldPlaceholder, QUICK_AMOUNT_STEPS } from '../app/config';
import { BudgetAppState } from '../hooks/useBudgetApp';
import { Button } from './ui/Button';
import { CategorySelect } from './ui/CategorySelect';

interface TransactionFormProps {
  budget: BudgetAppState;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ budget }) => {
  const {
    appMode,
    darkMode,
    themeColor,
    formRef,
    editingId,
    amount,
    date,
    category,
    description,
    store,
    paymentMethods,
    paymentMethod,
    currentCategoryGroups,
    placeFieldLabel,
    setAmount,
    setDate,
    setCategory,
    setDescription,
    setStore,
    setPaymentMethod,
    adjustAmount,
    handleAmountKeyDown,
    handleSubmit,
    cancelEdit,
  } = budget;

  const inputClass = `w-full p-2 border rounded-lg outline-none shadow-sm ${
    darkMode ? `bg-gray-700 border-gray-600 text-white focus:ring-${themeColor}-500` : 'bg-white border-gray-300'
  }`;

  return (
    <section
      ref={formRef}
      className={`rounded-xl shadow-sm p-5 border transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} ${
        editingId ? (darkMode ? 'border-blue-700' : 'border-blue-200 bg-blue-50/50') : ''
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{editingId ? 'Редактирование' : `Добавить ${appMode === 'income' ? 'Доход' : 'Расход'}`}</h2>
        {editingId && (
          <button type="button" onClick={cancelEdit} className="text-sm text-red-500 hover:underline">
            Отменить
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium opacity-70 mb-1">Сумма</label>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              value={amount}
              onKeyDown={handleAmountKeyDown}
              onChange={(event) => setAmount(event.target.value)}
              className={`w-full h-11 text-base p-2 pr-8 border rounded-lg focus:ring-2 outline-none shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                darkMode ? `bg-gray-700 border-gray-600 text-white focus:ring-${themeColor}-500` : `bg-white border-gray-300 focus:ring-${themeColor}-200`
              }`}
              placeholder="0"
            />
            <div className={`absolute right-0 top-0 bottom-0 flex flex-col border-l w-8 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
              <button
                type="button"
                onClick={() => adjustAmount(100)}
                className={`flex-1 flex items-center justify-center text-xs rounded-tr-lg hover:bg-opacity-20 transition-colors ${darkMode ? 'hover:bg-white text-gray-400' : 'hover:bg-black text-gray-500'}`}
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => adjustAmount(-100)}
                className={`flex-1 flex items-center justify-center text-xs rounded-br-lg border-t hover:bg-opacity-20 transition-colors ${darkMode ? 'border-gray-600 hover:bg-white text-gray-400' : 'border-gray-300 hover:bg-black text-gray-500'}`}
              >
                ▼
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 md:hidden">
            {QUICK_AMOUNT_STEPS.map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => adjustAmount(step)}
                className={`h-9 rounded-md text-xs font-semibold border transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-700'}`}
              >
                +{step}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-xs font-medium opacity-70 mb-1">Дата</label>
          <input type="date" required value={date} onChange={(event) => setDate(event.target.value)} className={inputClass} />
        </div>

        <div className="lg:col-span-3">
          <label className="block text-xs font-medium opacity-70 mb-1">Категория</label>
          <CategorySelect value={category} onChange={setCategory} groups={currentCategoryGroups} darkMode={darkMode} />
        </div>

        <div className="lg:col-span-3">
          <label className="block text-xs font-medium opacity-70 mb-1">{placeFieldLabel}</label>
          <input
            type="text"
            value={store}
            onChange={(event) => setStore(event.target.value)}
            placeholder={getPlaceFieldPlaceholder(appMode)}
            className={inputClass}
          />
        </div>

        <div className="lg:col-span-2">
          <label className="block text-xs font-medium opacity-70 mb-1">Способ оплаты</label>
          <select
            required
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
            className={`w-full h-11 p-2 border rounded-lg outline-none shadow-sm ${darkMode ? `bg-gray-700 border-gray-600 text-white focus:ring-${themeColor}-500` : 'bg-white border-gray-300'}`}
          >
            {paymentMethods.map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-10">
          <label className="block text-xs font-medium opacity-70 mb-1">Назначение</label>
          <input
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={appMode === 'income' ? 'Например: уроки' : 'Например: соленья'}
            className={inputClass}
          />
        </div>

        <div className="lg:col-span-2 flex items-end">
          <Button type="submit" className={`w-full font-bold shadow-md ${editingId ? 'bg-green-600 hover:bg-green-700' : (appMode === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700')}`}>
            {editingId ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </form>
    </section>
  );
};
