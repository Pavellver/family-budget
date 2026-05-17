import { AppHeader } from './components/AppHeader';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { BudgetPage } from './components/BudgetPage';
import { ManagementPage } from './components/ManagementPage';
import { useBudgetApp } from './hooks/useBudgetApp';

function App() {
  const budget = useBudgetApp();
  const { appMode, darkMode } = budget;
  const pageClass = `min-h-screen transition-colors duration-300 font-sans ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`;

  if (appMode === 'analysis') {
    return (
      <div className={pageClass}>
        <AppHeader budget={budget} />
        <main className="max-w-5xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Аналитический обзор</h2>
          </div>
          <AnalysisDashboard transactions={budget.transactions} darkMode={darkMode} />
        </main>
      </div>
    );
  }

  if (appMode === 'management') {
    return (
      <div className={pageClass}>
        <AppHeader budget={budget} />
        <main className="max-w-5xl mx-auto px-4 py-6 pb-20">
          <ManagementPage
            categorySettings={budget.categorySettings}
            paymentMethods={budget.paymentMethods}
            newPaymentMethod={budget.newPaymentMethod}
            darkMode={darkMode}
            onNewPaymentMethodChange={budget.setNewPaymentMethod}
            onAddPaymentMethod={budget.addPaymentMethod}
            onRenamePaymentMethod={budget.renamePaymentMethod}
            onRemovePaymentMethod={budget.removePaymentMethod}
            onResetPaymentMethods={budget.resetPaymentMethods}
            onAddGroup={budget.addCategoryGroup}
            onRenameGroup={budget.renameCategoryGroup}
            onRemoveGroup={budget.removeCategoryGroup}
            onAddCategory={budget.addCategoryToGroup}
            onRenameCategory={budget.renameCategory}
            onRemoveCategory={budget.removeCategory}
            onResetCategories={budget.resetCategories}
          />
        </main>
      </div>
    );
  }

  return (
    <div className={pageClass}>
      <AppHeader budget={budget} />
      <BudgetPage budget={budget} />
    </div>
  );
}

export default App;
