import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AccountGrid } from '@/components/AccountGrid'
import { Account } from '@/interfaces'

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

// Mock AccountCardWrapper — verify it renders for each filtered/sorted account
// without testing its internal logic (already covered).
vi.mock('@/components/AccountCardWrapper', () => ({
  AccountCardWrapper: ({ account, hasTransactions }: any) => (
    <div data-testid={`account-card-${account.id}`}>
      <span data-testid={`name-${account.id}`}>{account.name}</span>
      <span data-testid={`balance-${account.id}`}>{account.balance}</span>
      <span data-testid={`has-transactions-${account.id}`}>{String(hasTransactions)}</span>
    </div>
  ),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeAccount = (overrides: Partial<Account>): Account => ({
  id: 'acc-1',
  userId: 'user-1',
  name: 'Cuenta Test',
  bank: 'Banco Test',
  type: 'savings',
  currency: 'USD',
  balance: '10000',
  icon: 'account_balance',
  color: '137FEC',
  plaidId: null,
  transactionsCount: 0,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
  ...overrides,
})

const ACCOUNTS: Account[] = [
  makeAccount({ id: 'acc-1', name: 'Ahorros', balance: '50000', currency: 'USD', createdAt: new Date('2024-01-01') }),
  makeAccount({ id: 'acc-2', name: 'Inversiones', balance: '120000', currency: 'EUR', createdAt: new Date('2024-03-15') }),
  makeAccount({ id: 'acc-3', name: 'Corriente', balance: '8000', currency: 'USD', createdAt: new Date('2024-06-01'), transactionsCount: 5 }),
]

// AccountGrid is an async server component — we render it with render()
// like a regular component since jsdom has no RSC runtime.
const renderGrid = async (props: { accounts: Account[]; currency?: string[]; sort?: string; search?: string }) => {
  const { container } = render(await AccountGrid(props) as React.ReactElement)
  return container
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AccountGrid', () => {
  // ── Base rendering ────────────────────────────────────────────────────────

  // With no filters or sorting, all accounts are shown.
  it('renders all accounts when there are no filters', async () => {
    await renderGrid({ accounts: ACCOUNTS })

    expect(screen.getByTestId('account-card-acc-1')).toBeTruthy()
    expect(screen.getByTestId('account-card-acc-2')).toBeTruthy()
    expect(screen.getByTestId('account-card-acc-3')).toBeTruthy()
  })

  // ── Currency filtering ────────────────────────────────────────────────────

  // Only accounts matching the selected currency are shown.
  it('filters accounts by currency', async () => {
    await renderGrid({ accounts: ACCOUNTS, currency: ['USD'] })

    expect(screen.getByTestId('account-card-acc-1')).toBeTruthy()
    expect(screen.queryByTestId('account-card-acc-2')).toBeNull()
    expect(screen.getByTestId('account-card-acc-3')).toBeTruthy()
  })

  // With multiple currencies selected, all matching accounts are shown.
  it('filters accounts with multiple currencies', async () => {
    await renderGrid({ accounts: ACCOUNTS, currency: ['USD', 'EUR'] })

    expect(screen.getByTestId('account-card-acc-1')).toBeTruthy()
    expect(screen.getByTestId('account-card-acc-2')).toBeTruthy()
    expect(screen.getByTestId('account-card-acc-3')).toBeTruthy()
  })

  // ── Search filtering ──────────────────────────────────────────────────────

  // Search filters by account name (case-insensitive).
  it('filters accounts by name (case-insensitive)', async () => {
    await renderGrid({ accounts: ACCOUNTS, search: 'ahorro' })

    expect(screen.getByTestId('account-card-acc-1')).toBeTruthy()
    expect(screen.queryByTestId('account-card-acc-2')).toBeNull()
    expect(screen.queryByTestId('account-card-acc-3')).toBeNull()
  })

  // Empty search shows all accounts.
  it('empty search shows all accounts', async () => {
    await renderGrid({ accounts: ACCOUNTS, search: '' })

    expect(screen.getByTestId('account-card-acc-1')).toBeTruthy()
    expect(screen.getByTestId('account-card-acc-2')).toBeTruthy()
    expect(screen.getByTestId('account-card-acc-3')).toBeTruthy()
  })

  // ── Sorting ───────────────────────────────────────────────────────────────

  // highest_balance sorts by balance descending.
  it('sorts by balance descending with highest_balance', async () => {
    await renderGrid({ accounts: ACCOUNTS, sort: 'highest_balance' })

    const names = screen.getAllByTestId(/^name-acc/).map(el => el.textContent)
    expect(names).toEqual(['Inversiones', 'Ahorros', 'Corriente'])
  })

  // account_name sorts alphabetically.
  it('sorts alphabetically with account_name', async () => {
    await renderGrid({ accounts: ACCOUNTS, sort: 'account_name' })

    const names = screen.getAllByTestId(/^name-acc/).map(el => el.textContent)
    expect(names).toEqual(['Ahorros', 'Corriente', 'Inversiones'])
  })

  // recently_added sorts by creation date (most recent first).
  it('sorts by date with recently_added', async () => {
    await renderGrid({ accounts: ACCOUNTS, sort: 'recently_added' })

    const names = screen.getAllByTestId(/^name-acc/).map(el => el.textContent)
    expect(names).toEqual(['Corriente', 'Inversiones', 'Ahorros'])
  })

  // ── hasTransactions ───────────────────────────────────────────────────────

  // hasTransactions=true is passed when transactionsCount > 0.
  it('passes hasTransactions=true when account has transactions', async () => {
    await renderGrid({ accounts: ACCOUNTS })

    expect(screen.getByTestId('has-transactions-acc-3').textContent).toBe('true')
    expect(screen.getByTestId('has-transactions-acc-1').textContent).toBe('false')
  })
})
