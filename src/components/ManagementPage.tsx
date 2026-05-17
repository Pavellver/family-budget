import React, { useState } from 'react';
import { CategoryGroups, CategorySettings, TransactionType } from '../types';
import { Button } from './ui/Button';

type CategoryKind = TransactionType;

interface ManagementPageProps {
  categorySettings: CategorySettings;
  paymentMethods: string[];
  newPaymentMethod: string;
  darkMode: boolean;
  onNewPaymentMethodChange: (value: string) => void;
  onAddPaymentMethod: () => void;
  onRenamePaymentMethod: (oldMethod: string, newMethod: string) => void;
  onRemovePaymentMethod: (method: string) => void;
  onResetPaymentMethods: () => void;
  onAddGroup: (kind: CategoryKind, group: string) => void;
  onRenameGroup: (kind: CategoryKind, oldGroup: string, newGroup: string) => void;
  onRemoveGroup: (kind: CategoryKind, group: string) => void;
  onAddCategory: (kind: CategoryKind, group: string, category: string) => void;
  onRenameCategory: (kind: CategoryKind, group: string, oldCategory: string, newCategory: string) => void;
  onRemoveCategory: (kind: CategoryKind, group: string, category: string) => void;
  onResetCategories: (kind: CategoryKind) => void;
}

const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

const getGroupsByKind = (settings: CategorySettings, kind: CategoryKind): CategoryGroups =>
  kind === 'income' ? settings.incomeGroups : settings.expenseGroups;

const guideSections = [
  {
    title: 'Расходы',
    text: 'Здесь добавляются траты. Заполните сумму, дату, категорию, место или получателя, способ оплаты и назначение. В категории Автомобиль уже есть подкатегория Запчасти.',
  },
  {
    title: 'Доходы',
    text: 'Здесь фиксируются поступления. Поле Источник показывает, откуда пришли деньги: работа, подработка, кэшбэк, проценты, подарок или другой вариант.',
  },
  {
    title: 'История',
    text: 'История находится ниже формы. Можно выбрать период, включить нужные категории, искать по описанию, категории, месту, источнику и способу оплаты, сортировать по дате или сумме.',
  },
  {
    title: 'Анализ',
    text: 'Анализ показывает пульс бюджета: доходы, расходы, сальдо, накопления, прогноз, крупные покупки, топ категорий, места расходов, способы оплаты и динамику по месяцам.',
  },
  {
    title: 'Управление',
    text: 'Здесь меняются категории расходов, подкатегории, группы источников дохода, сами источники и способы оплаты. Настройки хранятся отдельно от операций.',
  },
  {
    title: 'JSON-файл',
    text: 'JSON - это полный бэкап приложения. Он выгружает операции, категории, источники дохода и способы оплаты. Для переноса на другой телефон или компьютер лучше использовать именно JSON.',
  },
  {
    title: 'Excel-файл',
    text: 'Excel - это таблица операций. В нем есть тип, дата, категория, место или источник, способ оплаты, сумма, описание и ID. Справочники целиком в Excel не сохраняются.',
  },
  {
    title: 'Загрузка файлов',
    text: 'При загрузке JSON или Excel приложение спросит: заменить текущие записи или дополнить их. Если в Excel есть новая категория, она попадет в Импорт расходов или Импорт доходов.',
  },
  {
    title: 'Выгрузка файлов',
    text: 'В меню доступны JSON и Excel. JSON нужен для надежного бэкапа и переноса настроек. Excel удобен, чтобы посмотреть, поправить или хранить операции в таблице.',
  },
  {
    title: 'Устройства',
    text: 'Приложение работает без сервера. Данные живут в браузере конкретного устройства. Полная очистка удаляет операции, а настройки категорий и способов оплаты остаются.',
  },
];

const GuideSection = ({ darkMode, panelClass }: { darkMode: boolean; panelClass: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
  <section className={`rounded-xl border shadow-sm p-4 ${panelClass}`}>
    <button
      type="button"
      onClick={() => setIsOpen(current => !current)}
      className="flex w-full items-center justify-between gap-3 text-left"
    >
      <div>
        <h3 className="text-lg font-semibold">Гайд по приложению</h3>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Короткая инструкция по страницам</p>
      </div>
      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {isOpen ? 'Скрыть' : 'Открыть'}
      </span>
    </button>

    {isOpen && (
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {guideSections.map((section) => (
          <article
            key={section.title}
            className={`rounded-lg border p-3 ${darkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-gray-50/70'}`}
          >
            <h4 className="text-sm font-semibold">{section.title}</h4>
            <p className={`mt-1 text-sm leading-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{section.text}</p>
          </article>
        ))}
      </div>
    )}
  </section>
  );
};

export const ManagementPage: React.FC<ManagementPageProps> = ({
  categorySettings,
  paymentMethods,
  newPaymentMethod,
  darkMode,
  onNewPaymentMethodChange,
  onAddPaymentMethod,
  onRenamePaymentMethod,
  onRemovePaymentMethod,
  onResetPaymentMethods,
  onAddGroup,
  onRenameGroup,
  onRemoveGroup,
  onAddCategory,
  onRenameCategory,
  onRemoveCategory,
  onResetCategories,
}) => {
  const [groupDrafts, setGroupDrafts] = useState<Record<string, string>>({});
  const [categoryDrafts, setCategoryDrafts] = useState<Record<string, string>>({});
  const [newGroups, setNewGroups] = useState<Record<CategoryKind, string>>({ expense: '', income: '' });
  const [newCategories, setNewCategories] = useState<Record<string, string>>({});

  const panelClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Управление</h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Настройки, справочники и короткая инструкция</p>
      </div>

      <GuideSection darkMode={darkMode} panelClass={panelClass} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategorySection
          title="Категории расходов"
          kind="expense"
          groupLabel="Категория"
          itemLabel="Подкатегория"
          newGroupPlaceholder="Новая категория"
          newItemPlaceholder="Новая подкатегория"
          groups={getGroupsByKind(categorySettings, 'expense')}
          darkMode={darkMode}
          panelClass={panelClass}
          groupDrafts={groupDrafts}
          categoryDrafts={categoryDrafts}
          newGroups={newGroups}
          newCategories={newCategories}
          setGroupDrafts={setGroupDrafts}
          setCategoryDrafts={setCategoryDrafts}
          setNewGroups={setNewGroups}
          setNewCategories={setNewCategories}
          onAddGroup={onAddGroup}
          onRenameGroup={onRenameGroup}
          onRemoveGroup={onRemoveGroup}
          onAddCategory={onAddCategory}
          onRenameCategory={onRenameCategory}
          onRemoveCategory={onRemoveCategory}
          onResetCategories={onResetCategories}
        />

        <CategorySection
          title="Источники дохода"
          kind="income"
          groupLabel="Группа источников"
          itemLabel="Источник дохода"
          newGroupPlaceholder="Новая группа"
          newItemPlaceholder="Новый источник"
          groups={getGroupsByKind(categorySettings, 'income')}
          darkMode={darkMode}
          panelClass={panelClass}
          groupDrafts={groupDrafts}
          categoryDrafts={categoryDrafts}
          newGroups={newGroups}
          newCategories={newCategories}
          setGroupDrafts={setGroupDrafts}
          setCategoryDrafts={setCategoryDrafts}
          setNewGroups={setNewGroups}
          setNewCategories={setNewCategories}
          onAddGroup={onAddGroup}
          onRenameGroup={onRenameGroup}
          onRemoveGroup={onRemoveGroup}
          onAddCategory={onAddCategory}
          onRenameCategory={onRenameCategory}
          onRemoveCategory={onRemoveCategory}
          onResetCategories={onResetCategories}
        />
      </div>

      <section className={`rounded-xl border shadow-sm p-4 ${panelClass}`}>
        <PaymentMethodsSection
          paymentMethods={paymentMethods}
          newPaymentMethod={newPaymentMethod}
          darkMode={darkMode}
          onNewPaymentMethodChange={onNewPaymentMethodChange}
          onAddPaymentMethod={onAddPaymentMethod}
          onRenamePaymentMethod={onRenamePaymentMethod}
          onRemovePaymentMethod={onRemovePaymentMethod}
          onResetPaymentMethods={onResetPaymentMethods}
        />
      </section>
    </div>
  );
};

interface CategorySectionProps {
  title: string;
  kind: CategoryKind;
  groupLabel: string;
  itemLabel: string;
  newGroupPlaceholder: string;
  newItemPlaceholder: string;
  groups: CategoryGroups;
  darkMode: boolean;
  panelClass: string;
  groupDrafts: Record<string, string>;
  categoryDrafts: Record<string, string>;
  newGroups: Record<CategoryKind, string>;
  newCategories: Record<string, string>;
  setGroupDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setCategoryDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setNewGroups: React.Dispatch<React.SetStateAction<Record<CategoryKind, string>>>;
  setNewCategories: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onAddGroup: (kind: CategoryKind, group: string) => void;
  onRenameGroup: (kind: CategoryKind, oldGroup: string, newGroup: string) => void;
  onRemoveGroup: (kind: CategoryKind, group: string) => void;
  onAddCategory: (kind: CategoryKind, group: string, category: string) => void;
  onRenameCategory: (kind: CategoryKind, group: string, oldCategory: string, newCategory: string) => void;
  onRemoveCategory: (kind: CategoryKind, group: string, category: string) => void;
  onResetCategories: (kind: CategoryKind) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  kind,
  groupLabel,
  itemLabel,
  newGroupPlaceholder,
  newItemPlaceholder,
  groups,
  darkMode,
  panelClass,
  groupDrafts,
  categoryDrafts,
  newGroups,
  newCategories,
  setGroupDrafts,
  setCategoryDrafts,
  setNewGroups,
  setNewCategories,
  onAddGroup,
  onRenameGroup,
  onRemoveGroup,
  onAddCategory,
  onRenameCategory,
  onRemoveCategory,
  onResetCategories,
}) => {
  const inputClass = `h-9 rounded-lg border px-3 text-sm outline-none ${
    darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
  }`;
  const outlineButtonClass = `h-9 text-xs ${darkMode ? 'border-gray-600 bg-gray-800 text-gray-100 hover:bg-gray-700' : ''}`;
  const groupEntries = Object.entries(groups);

  const handleAddGroup = (event: React.FormEvent) => {
    event.preventDefault();
    onAddGroup(kind, newGroups[kind]);
    setNewGroups((current) => ({ ...current, [kind]: '' }));
  };

  return (
    <section className={`rounded-xl border shadow-sm p-4 ${panelClass}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button
          type="button"
          onClick={() => onResetCategories(kind)}
          className={`text-xs font-medium hover:underline ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
        >
          Сбросить
        </button>
      </div>

      <div className="space-y-4">
        {groupEntries.map(([group, categories]) => {
          const groupKey = `${kind}:${group}`;
          const groupDraft = groupDrafts[groupKey] ?? group;

          return (
            <div key={group} className={`rounded-lg border p-3 ${darkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-gray-50/70'}`}>
              <div className={`mb-1 text-[11px] font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {groupLabel}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={groupDraft}
                  onChange={(event) => setGroupDrafts((current) => ({ ...current, [groupKey]: event.target.value }))}
                  className={`${inputClass} flex-1 font-semibold`}
                />
                <Button type="button" variant="outline" className={outlineButtonClass} onClick={() => onRenameGroup(kind, group, groupDraft)}>
                  Сохранить
                </Button>
                <button
                  type="button"
                  aria-label={`Удалить группу ${group}`}
                  onClick={() => onRemoveGroup(kind, group)}
                  className={`h-9 w-9 rounded-lg border flex items-center justify-center text-red-500 ${
                    darkMode ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-white'
                  }`}
                >
                  <DeleteIcon />
                </button>
              </div>

              <div className={`mt-3 mb-1 text-[11px] font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {itemLabel}
              </div>
              <div className="mt-3 space-y-2">
                {categories.map((category) => {
                  const categoryKey = `${kind}:${group}:${category}`;
                  const categoryDraft = categoryDrafts[categoryKey] ?? category;

                  return (
                    <div key={category} className="flex gap-2">
                      <input
                        value={categoryDraft}
                        onChange={(event) => setCategoryDrafts((current) => ({ ...current, [categoryKey]: event.target.value }))}
                        className={`${inputClass} min-w-0 flex-1`}
                      />
                      <Button type="button" variant="outline" className={`${outlineButtonClass} px-3`} onClick={() => onRenameCategory(kind, group, category, categoryDraft)}>
                        OK
                      </Button>
                      <button
                        type="button"
                        aria-label={`Удалить категорию ${category}`}
                        onClick={() => onRemoveCategory(kind, group, category)}
                        className={`h-9 w-9 rounded-lg border flex items-center justify-center text-red-500 ${
                          darkMode ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-white'
                        }`}
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  );
                })}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  onAddCategory(kind, group, newCategories[groupKey]);
                  setNewCategories((current) => ({ ...current, [groupKey]: '' }));
                }}
                className="mt-3 flex gap-2"
              >
                <input
                  value={newCategories[groupKey] || ''}
                  onChange={(event) => setNewCategories((current) => ({ ...current, [groupKey]: event.target.value }))}
                  placeholder={newItemPlaceholder}
                  className={`${inputClass} min-w-0 flex-1`}
                />
                <Button type="submit" className="h-9 px-3 text-xs">
                  Добавить
                </Button>
              </form>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleAddGroup} className={`mt-4 flex gap-2 border-t pt-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <input
          value={newGroups[kind]}
          onChange={(event) => setNewGroups((current) => ({ ...current, [kind]: event.target.value }))}
          placeholder={newGroupPlaceholder}
          className={`${inputClass} min-w-0 flex-1`}
        />
        <Button type="submit" className="h-9 px-3 text-xs">
          Добавить
        </Button>
      </form>
    </section>
  );
};

interface PaymentMethodsSectionProps {
  paymentMethods: string[];
  newPaymentMethod: string;
  darkMode: boolean;
  onNewPaymentMethodChange: (value: string) => void;
  onAddPaymentMethod: () => void;
  onRenamePaymentMethod: (oldMethod: string, newMethod: string) => void;
  onRemovePaymentMethod: (method: string) => void;
  onResetPaymentMethods: () => void;
}

const PaymentMethodsSection: React.FC<PaymentMethodsSectionProps> = ({
  paymentMethods,
  newPaymentMethod,
  darkMode,
  onNewPaymentMethodChange,
  onAddPaymentMethod,
  onRenamePaymentMethod,
  onRemovePaymentMethod,
  onResetPaymentMethods,
}) => {
  const [methodDrafts, setMethodDrafts] = useState<Record<string, string>>({});
  const inputClass = `h-9 rounded-lg border px-3 text-sm outline-none ${
    darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
  }`;
  const outlineButtonClass = `h-9 text-xs ${darkMode ? 'border-gray-600 bg-gray-800 text-gray-100 hover:bg-gray-700' : ''}`;

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    onAddPaymentMethod();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Способы оплаты</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Карты, банки, наличные и другие варианты</p>
        </div>
        <button
          type="button"
          onClick={onResetPaymentMethods}
          className={`text-xs font-medium hover:underline ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
        >
          Сбросить
        </button>
      </div>

      <div className="space-y-2">
        {paymentMethods.map((method) => {
          const draft = methodDrafts[method] ?? method;

          return (
            <div key={method} className="flex gap-2">
              <input
                value={draft}
                onChange={(event) => setMethodDrafts(current => ({ ...current, [method]: event.target.value }))}
                className={`${inputClass} min-w-0 flex-1`}
              />
              <Button type="button" variant="outline" className={`${outlineButtonClass} px-3`} onClick={() => onRenamePaymentMethod(method, draft)}>
                OK
              </Button>
              <button
                type="button"
                aria-label={`Удалить способ оплаты ${method}`}
                onClick={() => onRemovePaymentMethod(method)}
                className={`h-9 w-9 rounded-lg border flex items-center justify-center text-red-500 ${
                  darkMode ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-white'
                }`}
              >
                <DeleteIcon />
              </button>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleAdd} className={`mt-4 flex gap-2 border-t pt-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <input
          value={newPaymentMethod}
          onChange={(event) => onNewPaymentMethodChange(event.target.value)}
          placeholder="Новый способ оплаты"
          className={`${inputClass} min-w-0 flex-1`}
        />
        <Button type="submit" className="h-9 px-3 text-xs">
          Добавить
        </Button>
      </form>
    </div>
  );
};
