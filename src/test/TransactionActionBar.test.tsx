import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// ── Mocks ──

const {
  mockTranslations,
  setSearchTermMock,
  setTypeMock,
  setCategoryMock,
  setSortMock,
  mockActionBar,
  mockFilterDropdown,
  mockSortDropdown,
  useFilterParamMock,
} = vi.hoisted(() => {
  const setSearchTermMock = vi.fn()
  const setTypeMock = vi.fn()
  const setCategoryMock = vi.fn()
  const setSortMock = vi.fn()

  const mockTranslations = vi.fn((key: string) => key)

  const mockActionBar = vi.fn(({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
    return (
      <div data-testid="action-bar">
        {children}
      </div>
    )
  })

  const mockFilterDropdown = vi.fn((props: Record<string, unknown>) => {
    return <div data-testid="filter-dropdown" />
  })

  const mockSortDropdown = vi.fn((props: Record<string, unknown>) => {
    return <div data-testid="sort-dropdown" />
  })

  const useFilterParamMock = vi.fn((key: string) => {
    if (key === 'type') return ['expense', setTypeMock]
    if (key === 'category') return ['cat-1', setCategoryMock]
    return ['', vi.fn()]
  })

  return {
    mockTranslations,
    setSearchTermMock,
    setTypeMock,
    setCategoryMock,
    setSortMock,
    mockActionBar,
    mockFilterDropdown,
    mockSortDropdown,
    useFilterParamMock,
  }
})

vi.mock('next-intl', () => ({
  useTranslations: () => mockTranslations,
}))

vi.mock('@/hooks/use-debounced-search-params', () => ({
  useDebouncedSearchParam: vi.fn(() => ['test-search', setSearchTermMock]),
}))

vi.mock('@/hooks/use-filter-params', () => ({
  useFilterParam: useFilterParamMock,
}))

vi.mock('@/hooks/use-sort-params', () => ({
  useSortParam: vi.fn(() => ['date', setSortMock]),
}))

vi.mock('@/components/ActionBar', () => ({
  default: mockActionBar,
}))

vi.mock('@/components/FilterDropdown', () => ({
  default: mockFilterDropdown,
}))

vi.mock('@/components/SortDropdown', () => ({
  default: mockSortDropdown,
}))

vi.mock('@/lib/export-csv', () => ({
  exportTransactionsToCSV: vi.fn(),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
}))

// ── Component Under Test ──

import TransactionActionBar from '@/components/TransactionActionBar'

const CATEGORIES = [
  { id: 'cat-1', name: 'Food' },
  { id: 'cat-2', name: 'Transport' },
]

const MOCK_TRANSACTIONS = [
  {
    id: '1',
    type: 'expense' as const,
    amount: '50.00',
    payee: 'Test Store',
    accountId: 'acc1',
    categoryId: 'cat-1',
    notes: null,
    date: new Date('2024-01-15'),
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    accountName: 'Checking',
    categoryName: 'Food',
  },
]

// ── Tests ──

describe('TransactionActionBar', () => {
  it('renders the ActionBar component', () => {
    render(<TransactionActionBar categories={CATEGORIES} transactions={MOCK_TRANSACTIONS} />)

    expect(screen.getByTestId('action-bar')).toBeDefined()
    expect(mockActionBar).toHaveBeenCalledOnce()
  })

  it('passes correct type filter options to FilterDropdown', () => {
    render(<TransactionActionBar categories={CATEGORIES} transactions={MOCK_TRANSACTIONS} />)

    const firstCall = mockFilterDropdown.mock.calls[0]
    const props = firstCall[0]

    expect(props.label).toBe('action.filter_type')
    expect(props.options).toEqual([
      { label: 'filter.expenses', value: 'expense' },
      { label: 'filter.income', value: 'income' },
    ])
  })

  it('passes categories as options to category FilterDropdown', () => {
    render(<TransactionActionBar categories={CATEGORIES} transactions={MOCK_TRANSACTIONS} />)

    const secondCall = mockFilterDropdown.mock.calls[1]
    const props = secondCall[0]

    expect(props.label).toBe('action.filter_category')
    expect(props.options).toEqual([
      { label: 'Food', value: 'cat-1' },
      { label: 'Transport', value: 'cat-2' },
    ])
  })

  it('passes correct sort options to SortDropdown', () => {
    render(<TransactionActionBar categories={CATEGORIES} transactions={MOCK_TRANSACTIONS} />)

    const lastCall = mockSortDropdown.mock.calls[mockSortDropdown.mock.calls.length - 1]
    const props = lastCall[0]

    expect(props.options).toEqual([
      { label: 'sort.date', value: 'date' },
      { label: 'sort.amount_high', value: 'amount_high' },
      { label: 'sort.amount_low', value: 'amount_low' },
      { label: 'sort.recently_added', value: 'recently_added' },
    ])
  })

  it('search term state is connected to useDebouncedSearchParam', () => {
    render(<TransactionActionBar categories={CATEGORIES} transactions={MOCK_TRANSACTIONS} />)

    const lastCall = mockActionBar.mock.calls[mockActionBar.mock.calls.length - 1]
    const props = lastCall[0]

    expect(props.searchTerm).toBe('test-search')
    expect(props.setSearchTerm).toBe(setSearchTermMock)
  })

  it('type filter state is connected to useFilterParam', () => {
    render(<TransactionActionBar categories={CATEGORIES} transactions={MOCK_TRANSACTIONS} />)

    const firstCall = mockFilterDropdown.mock.calls[0]
    const props = firstCall[0]

    expect(props.selected).toBe('expense')
    expect(props.onChange).toBe(setTypeMock)
  })

  it('category filter state is connected to useFilterParam', () => {
    render(<TransactionActionBar categories={CATEGORIES} transactions={MOCK_TRANSACTIONS} />)

    const secondCall = mockFilterDropdown.mock.calls[1]
    const props = secondCall[0]

    expect(props.selected).toBe('cat-1')
    expect(props.onChange).toBe(setCategoryMock)
  })

  it('sort state is connected to useSortParam', () => {
    render(<TransactionActionBar categories={CATEGORIES} transactions={MOCK_TRANSACTIONS} />)

    const lastCall = mockSortDropdown.mock.calls[mockSortDropdown.mock.calls.length - 1]
    const props = lastCall[0]

    expect(props.selected).toBe('date')
    expect(props.onChange).toBe(setSortMock)
  })

  it('has correct href for new transaction button pointing to /transaction/create', () => {
    render(<TransactionActionBar categories={CATEGORIES} transactions={MOCK_TRANSACTIONS} />)

    const lastCall = mockActionBar.mock.calls[mockActionBar.mock.calls.length - 1]
    const props = lastCall[0]

    expect(props.href).toBe('/transaction/create')
  })

  it('renders export CSV button', () => {
    render(<TransactionActionBar categories={CATEGORIES} transactions={MOCK_TRANSACTIONS} />)

    expect(screen.getByTestId('export-csv-button')).toBeDefined()
  })

  it('export button displays correct label', () => {
    render(<TransactionActionBar categories={CATEGORIES} transactions={MOCK_TRANSACTIONS} />)

    const button = screen.getByTestId('export-csv-button')
    expect(button.textContent).toContain('action.export_csv')
  })

  it('renders bulk add button with correct link', () => {
    render(<TransactionActionBar categories={CATEGORIES} transactions={MOCK_TRANSACTIONS} />)

    const bulkButton = screen.getByTestId('bulk-add-button')
    expect(bulkButton).toBeDefined()
    expect(bulkButton.getAttribute('href')).toBe('/transaction/bulk')
    expect(bulkButton.textContent).toContain('action.bulk_add')
  })
})
