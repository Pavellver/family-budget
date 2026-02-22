import { Transaction } from '../types';

export const mergeTransactions = (existing: Transaction[], incoming: Transaction[]): Transaction[] => {
  const usedIds = new Set(existing.map((t) => t.id));
  let suffix = 0;

  const normalizedIncoming = incoming.map((t) => {
    let nextId = t.id;
    while (usedIds.has(nextId)) {
      suffix += 1;
      nextId = `${t.id}_import_${suffix}`;
    }
    usedIds.add(nextId);
    return { ...t, id: nextId };
  });

  return [...normalizedIncoming, ...existing];
};
