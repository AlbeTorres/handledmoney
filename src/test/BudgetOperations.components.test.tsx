import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createGroup: vi.fn(),
  updateGroup: vi.fn(),
  deleteGroup: vi.fn(),
  createItem: vi.fn(),
  getCategories: vi.fn(),
  createCategory: vi.fn(),
  setCurrent: vi.fn(),
  duplicate: vi.fn(),
  updateBudget: vi.fn(),
  deleteBudget: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}))
vi.mock('@/actions/budget/budget-item', () => ({
  createBudgetGroupAction: mocks.createGroup,
  updateBudgetGroupAction: mocks.updateGroup,
  deleteBudgetGroupAction: mocks.deleteGroup,
  createBudgetItemAction: mocks.createItem,
}))
vi.mock('@/actions/category/get-categories', () => ({
  getCategoriesByUserAction: mocks.getCategories,
}))
vi.mock('@/actions/category/create-category', () => ({
  createCategoryAction: mocks.createCategory,
}))
vi.mock('@/actions/budget/select-current-budget', () => ({
  selectCurrentBudgetAction: mocks.setCurrent,
}))
vi.mock('@/actions/budget/duplicate-budget', () => ({ duplicateBudgetAction: mocks.duplicate }))
vi.mock('@/actions/budget/update-budget', () => ({ updateBudgetAction: mocks.updateBudget }))
vi.mock('@/actions/budget/delete-budget', () => ({ deleteBudgetAction: mocks.deleteBudget }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}))
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))
vi.mock('sonner', () => ({ toast: { success: mocks.success, error: mocks.error } }))
// Standard repo mock: useTranslations returns the key path itself.
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import { BudgetDetailView } from '@/app/(financeapp)/budget/_components/BudgetDetailView'
import { BudgetGrid } from '@/app/(financeapp)/budget/_components/BudgetGrid'
import { BudgetGroupSection } from '@/app/(financeapp)/budget/_components/BudgetGroupSection'
import { AddBudgetGroupForm } from '@/components/AddBudgetGroupForm'
import { AddBudgetItemForm } from '@/components/AddBudgetItemForm'

const budgetId = '00000000-0000-0000-0000-000000000001'
const budget = {
  id: budgetId,
  userId: 'user-1',
  name: 'Plan',
  startDate: new Date('2026-01-01'),
  endDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  totalIncome: 1000,
  totalAllocated: 700,
  remainingToAllocate: 300,
  groups: [],
}

describe('Budget operation components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createGroup.mockResolvedValue({ success: true })
    mocks.updateGroup.mockResolvedValue({ success: true })
    mocks.getCategories.mockResolvedValue({ success: true, data: [] })
    mocks.createCategory.mockResolvedValue({
      success: true,
      data: { id: 'category-1', name: 'Salary' },
    })
    mocks.createItem.mockResolvedValue({ success: true })
    mocks.setCurrent.mockResolvedValue({ success: true })
    mocks.duplicate.mockResolvedValue({ success: true, data: { id: 'new-budget' } })
  })

  it('creates an outflow group with the budget-owned sort order', async () => {
    const user = userEvent.setup()
    render(<AddBudgetGroupForm budgetId={budgetId} nextSortOrder={6} />)
    await user.click(screen.getByRole('button', { name: /add group/i }))
    await user.type(screen.getByLabelText('Group name'), 'Home')
    await user.click(screen.getByRole('button', { name: /^add group$/i }))
    await waitFor(() =>
      expect(mocks.createGroup).toHaveBeenCalledWith(
        { budgetId, name: 'Home', calculationType: 'outflow', sortOrder: 6 },
        budgetId,
      ),
    )
  })

  it('renders a budget group header and collapses its category rows', async () => {
    const user = userEvent.setup()
    render(
      <BudgetGroupSection
        budgetId={budgetId}
        group={{
          id: 'group-1',
          budgetId,
          name: 'Bills',
          calculationType: 'outflow',
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [],
          groupPlanned: 0,
          groupActual: 0,
        }}
      />,
    )
    expect(screen.getByText('Bills')).toBeInTheDocument()
    expect(screen.getByText('group.expense_badge')).toBeInTheDocument()
    expect(screen.getByText('group.no_categories')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'group.toggle' }))
    expect(screen.queryByText('group.no_categories')).not.toBeInTheDocument()
  })

  it('quick-creates a category from the item name and auto-selects it', async () => {
    const user = userEvent.setup()
    render(
      <AddBudgetItemForm
        budgetId={budgetId}
        groupId='00000000-0000-0000-0000-000000000002'
        calculationType='income'
      />,
    )
    await user.click(screen.getByRole('button', { name: /add item/i }))
    await user.type(screen.getByLabelText('Name'), 'Salary')
    await user.click(screen.getByRole('button', { name: /create category from item name/i }))
    await waitFor(() =>
      expect(mocks.createCategory).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Salary', type: 'income' }),
      ),
    )
    await waitFor(() => expect(mocks.success).toHaveBeenCalledWith('Category created and selected'))
  })

  it('marks the current card and drives set-current plus dated duplication from the card menu', async () => {
    const user = userEvent.setup()
    render(
      <>
        <BudgetGrid budgets={[budget]} currentBudgetId={budgetId} />
        <BudgetDetailView budget={budget} />
      </>,
    )
    expect(screen.getByText('list.current')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'card.options_aria' }))
    await user.click(screen.getByRole('menuitem', { name: 'card.set_current' }))
    await waitFor(() => expect(mocks.setCurrent).toHaveBeenCalledWith(budgetId))

    await user.click(screen.getByRole('button', { name: 'card.options_aria' }))
    await user.click(screen.getByRole('menuitem', { name: 'card.duplicate' }))
    const startDate = screen.getByLabelText('card.duplicate_start_date')
    await user.clear(startDate)
    await user.type(startDate, '2025-12-01')
    await user.click(screen.getByRole('button', { name: 'card.duplicate_submit' }))
    await waitFor(() =>
      expect(mocks.duplicate).toHaveBeenCalledWith(
        expect.objectContaining({ id: budgetId, startDate: expect.any(Date) }),
      ),
    )
  })

  it('shows a zero-based card summary with date, planned income, allocation and balance', () => {
    render(<BudgetGrid budgets={[budget]} currentBudgetId={budgetId} />)
    expect(screen.getByText('list.planned_income')).toBeInTheDocument()
    expect(screen.getByText('list.ready_to_assign')).toBeInTheDocument()
    expect(screen.getByText('$1,000.00')).toBeInTheDocument()
    expect(screen.getByText('$300.00')).toBeInTheDocument()
    expect(screen.getByText(/Jan 1, 2026/)).toBeInTheDocument()
  })
})
