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
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))
vi.mock('sonner', () => ({ toast: { success: mocks.success, error: mocks.error } }))

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

  it('renames a rendered budget group', async () => {
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
    await user.click(screen.getByRole('button', { name: 'Rename Bills' }))
    await user.clear(screen.getByLabelText('Group name'))
    await user.type(screen.getByLabelText('Group name'), 'Home')
    await user.click(screen.getByRole('button', { name: 'Save group name' }))
    await waitFor(() =>
      expect(mocks.updateGroup).toHaveBeenCalledWith({ id: 'group-1', name: 'Home' }, budgetId),
    )
  })

  it('filters item categories by group type and auto-selects an inline created category', async () => {
    const user = userEvent.setup()
    render(
      <AddBudgetItemForm
        budgetId={budgetId}
        groupId='00000000-0000-0000-0000-000000000002'
        calculationType='income'
      />,
    )
    await user.click(screen.getByRole('button', { name: /add item/i }))
    await waitFor(() => expect(mocks.getCategories).toHaveBeenCalledWith('income'))
    await user.type(screen.getByLabelText('Name'), 'Salary')
    await user.click(screen.getByRole('button', { name: /create category from item name/i }))
    await waitFor(() =>
      expect(mocks.createCategory).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Salary', type: 'income' }),
      ),
    )
    await waitFor(() => expect(mocks.success).toHaveBeenCalledWith('Category created and selected'))
  })

  it('marks the current card and exposes current selection plus dated duplication controls', async () => {
    const user = userEvent.setup()
    render(
      <>
        <BudgetGrid budgets={[budget]} currentBudgetId={budgetId} />
        <BudgetDetailView budget={budget} />
      </>,
    )
    expect(screen.getByText('Current')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /set current/i }))
    await waitFor(() => expect(mocks.setCurrent).toHaveBeenCalledWith(budgetId))
    await user.click(screen.getByRole('button', { name: /^duplicate$/i }))
    const startDate = screen.getByLabelText('Duplicate start date')
    await user.clear(startDate)
    await user.type(startDate, '2025-12-01')
    await user.click(screen.getByRole('button', { name: /duplicate budget/i }))
    await waitFor(() =>
      expect(mocks.duplicate).toHaveBeenCalledWith(
        expect.objectContaining({ id: budgetId, startDate: expect.any(Date) }),
      ),
    )
  })

  it('shows a zero-based card summary with date, planned income, allocation and balance', () => {
    render(<BudgetGrid budgets={[budget]} currentBudgetId={budgetId} />)
    expect(screen.getByText('Planned income')).toBeInTheDocument()
    expect(screen.getByText('Ready to assign')).toBeInTheDocument()
    expect(screen.getByText('$1,000.00')).toBeInTheDocument()
    expect(screen.getByText('$300.00')).toBeInTheDocument()
    expect(screen.getByText(/Jan 1, 2026/)).toBeInTheDocument()
  })
})
