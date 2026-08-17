export const dashboardSnapshot = {
  budget: {
    id: 'budget-1',
    name: 'Household budget',
    groups: [
      {
        id: 'income-group',
        name: 'Income',
        calculationType: 'income' as const,
        sortOrder: 0,
        items: [{ id: 'salary-plan', categoryId: 'salary', name: 'Salary', plannedAmount: '1000' }],
      },
      {
        id: 'expense-group',
        name: 'Essentials',
        calculationType: 'outflow' as const,
        sortOrder: 1,
        items: [{ id: 'rent-plan', categoryId: 'rent', name: 'Rent', plannedAmount: '800' }],
      },
    ],
  },
  categories: [
    { id: 'salary', name: 'Salary', type: 'income' as const },
    { id: 'rent', name: 'Rent', type: 'expense' as const },
    { id: 'food', name: 'Food', type: 'expense' as const },
  ],
  transactions: [
    { id: 'salary-actual', categoryId: 'salary', type: 'income' as const, amount: '1200', date: new Date('2026-01-10T00:00:00.000Z') },
    { id: 'rent-actual', categoryId: 'rent', type: 'expense' as const, amount: '700', date: new Date('2026-01-12T00:00:00.000Z') },
    { id: 'food-actual', categoryId: 'food', type: 'expense' as const, amount: '50', date: new Date('2026-01-20T00:00:00.000Z') },
    { id: 'uncategorized-actual', categoryId: null, type: 'expense' as const, amount: '25', date: new Date('2026-01-21T00:00:00.000Z') },
  ],
  accounts: [
    { id: 'account-usd', name: 'Cash', type: 'cash', currency: 'USD', balance: '500' },
    { id: 'account-eur', name: 'Legacy bank', type: 'bank', currency: 'EUR', balance: '200' },
  ],
}
