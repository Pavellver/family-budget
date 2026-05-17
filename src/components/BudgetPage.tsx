import React from 'react';
import { BudgetAppState } from '../hooks/useBudgetApp';
import { BudgetOverview } from './BudgetOverview';
import { TransactionForm } from './TransactionForm';
import { TransactionHistory } from './TransactionHistory';

interface BudgetPageProps {
  budget: BudgetAppState;
}

export const BudgetPage: React.FC<BudgetPageProps> = ({ budget }) => (
  <main className="max-w-5xl mx-auto px-4 py-6 pb-20 space-y-6">
    <TransactionForm budget={budget} />
    <BudgetOverview budget={budget} />
    <TransactionHistory budget={budget} />
  </main>
);
