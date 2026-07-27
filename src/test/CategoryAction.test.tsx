import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// ── Mocks ──

const {
  mockTranslations,
  setSearchTermMock,
  setTypeMock,
  setSortMock,
  mockActionBar,
  mockFilterDropdown,
  mockSortDropdown,
} = vi.hoisted(() => {
  const setSearchTermMock = vi.fn()
  const setTypeMock = vi.fn()
  const setSortMock = vi.fn()

  let actionBarProps: Record<string, unknown> = {}
  let filterDropdownProps: Record<string, unknown> = {}
  let sortDropdownProps: Record<string, unknown> = {}

  const mockTranslations = vi.fn((key: string) => key)

  const mockActionBar = vi.fn(({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
    actionBarProps = props
    return (
      <div data-testid="action-bar">
        {children}
      </div>
    )
  })

  const mockFilterDropdown = vi.fn((props: Record<string, unknown>) => {
    filterDropdownProps = props
    return <div data-testid="filter-dropdown" />
  })

  const mockSortDropdown = vi.fn((props: Record<string, unknown>) => {
    sortDropdownProps = props
    return <div data-testid="sort-dropdown" />
  })

  return {
    mockTranslations,
    setSearchTermMock,
    setTypeMock,
    setSortMock,
    mockActionBar,
    mockFilterDropdown,
    mockSortDropdown,
  }
})

vi.mock('next-intl', () => ({
  useTranslations: () => mockTranslations,
}))

vi.mock('@/hooks/use-debounced-search-params', () => ({
  useDebouncedSearchParam: vi.fn(() => ['test-search', setSearchTermMock]),
}))

vi.mock('@/hooks/use-filter-params', () => ({
  useFilterParam: vi.fn(() => ['expenses', setTypeMock]),
}))

vi.mock('@/hooks/use-sort-params', () => ({
  useSortParam: vi.fn(() => ['category_name', setSortMock]),
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

// ── Component Under Test ──

import CategoryAction from '@/components/CategoryAction'

// ── Tests ──

describe('CategoryAction', () => {
  it('renders the ActionBar component', () => {
    render(<CategoryAction />)

    expect(screen.getByTestId('action-bar')).toBeDefined()
    expect(mockActionBar).toHaveBeenCalledOnce()
  })

  it('passes correct props to FilterDropdown with expenses and income options', () => {
    render(<CategoryAction />)

    const lastCall = mockFilterDropdown.mock.calls[mockFilterDropdown.mock.calls.length - 1]
    const props = lastCall[0]

    expect(props.label).toBe('action.filter_view')
    expect(props.options).toEqual([
      { label: 'filter.expenses', value: 'expenses' },
      { label: 'filter.income', value: 'income' },
    ])
    expect(props.selected).toBe('expenses')
  })

  it('passes correct props to SortDropdown with category_name and recently_added options', () => {
    render(<CategoryAction />)

    const lastCall = mockSortDropdown.mock.calls[mockSortDropdown.mock.calls.length - 1]
    const props = lastCall[0]

    expect(props.options).toEqual([
      { label: 'sort.category_name', value: 'category_name' },
      { label: 'sort.recently_added', value: 'recently_added' },
    ])
    expect(props.selected).toBe('category_name')
  })

  it('search term state is connected to useDebouncedSearchParam', () => {
    render(<CategoryAction />)

    const lastCall = mockActionBar.mock.calls[mockActionBar.mock.calls.length - 1]
    const props = lastCall[0]

    expect(props.searchTerm).toBe('test-search')
    expect(props.setSearchTerm).toBe(setSearchTermMock)
  })

  it('filter state is connected to useFilterParam', () => {
    render(<CategoryAction />)

    const lastCall = mockFilterDropdown.mock.calls[mockFilterDropdown.mock.calls.length - 1]
    const props = lastCall[0]

    expect(props.selected).toBe('expenses')
    expect(props.onChange).toBe(setTypeMock)
  })

  it('sort state is connected to useSortParam', () => {
    render(<CategoryAction />)

    const lastCall = mockSortDropdown.mock.calls[mockSortDropdown.mock.calls.length - 1]
    const props = lastCall[0]

    expect(props.selected).toBe('category_name')
    expect(props.onChange).toBe(setSortMock)
  })

  it('has correct href for new category button pointing to /category/create', () => {
    render(<CategoryAction />)

    const lastCall = mockActionBar.mock.calls[mockActionBar.mock.calls.length - 1]
    const props = lastCall[0]

    expect(props.href).toBe('/category/create')
  })
})
