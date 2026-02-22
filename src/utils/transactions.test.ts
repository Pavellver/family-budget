import { describe, expect, it } from 'vitest';
import { Transaction } from '../types';
import { mergeTransactions } from './transactions';

const tx = (id: string): Transaction => ({
  id,
  date: '2025-01-01',
  amount: 1000,
  category: 'Продукты',
  description: '',
  type: 'expense',
  createdAt: 1,
});

describe('mergeTransactions', () => {
  it('appends imported data without removing existing entries', () => {
    const existing = [tx('e1')];
    const incoming = [tx('i1'), tx('i2')];
    const merged = mergeTransactions(existing, incoming);

    expect(merged).toHaveLength(3);
    expect(merged.some((t) => t.id === 'e1')).toBe(true);
    expect(merged.some((t) => t.id === 'i1')).toBe(true);
    expect(merged.some((t) => t.id === 'i2')).toBe(true);
  });

  it('renames duplicate imported ids to keep all records', () => {
    const existing = [tx('same')];
    const incoming = [tx('same')];
    const merged = mergeTransactions(existing, incoming);

    expect(merged).toHaveLength(2);
    expect(merged.filter((t) => t.id === 'same')).toHaveLength(1);
    expect(merged.some((t) => t.id.startsWith('same_import_'))).toBe(true);
  });
});
