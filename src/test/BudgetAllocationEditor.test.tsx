import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { BudgetCategory } from '@/components/CategoryCombobox'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  back: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  createBudget: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: mocks.back, push: mocks.push, refresh: mocks.refresh }),
}))
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@/actions/budget/create-budget', () => ({ createBudgetAction: mocks.createBudget }))
vi.mock('@/components/QuickCreateCategoryDrawer', () => ({ QuickCreateCategoryDrawer: () => null }))

import { CreateBudgetForm } from '@/components/CreateBudgetForm'

const incomeCategories: BudgetCategory[] = [
  { id: '9f7d1f5e-0a4f-4b8e-9a1c-2c3d4e5f6070', name: 'Salary', type: 'income', icon: 'wallet', color: '137FEC' },
  { id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', name: 'Interest', type: 'income', icon: 'percent', color: 'F59E0B' },
]
const expenseCategories: BudgetCategory[] = [
  { id: 'b6a5f1d0-1a2b-4c3d-8e9f-0a1b2c3d4e5f', name: 'Groceries', type: 'expense', icon: 'cart', color: '22C55E' },
  { id: 'c7d8e9f0-2b3c-4d5e-9a8b-1c2d3e4f5060', name: 'Utilities', type: 'expense', icon: 'zap', color: '3B82F6' },
]
const allCategories = [...incomeCategories, ...expenseCategories]

function categoryComboboxes() {
  return screen.getAllByRole('combobox').filter(element => element.getAttribute('data-slot') !== 'select-trigger')
}

async function goToStructure(user: ReturnType<typeof userEvent.setup>, name = 'August') {
  await user.type(screen.getByLabelText('name'), name)
  await user.click(screen.getByRole('button', { name: 'next' }))
}

// Drives the real wizard: fills metadata, selects an income category and one
// outflow category in step 2, then advances to the allocation step.
async function setUpPlan(user: ReturnType<typeof userEvent.setup>) {
  await goToStructure(user)
  await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_structure' })).toBeInTheDocument())

  await user.click(screen.getAllByRole('button', { name: 'add_category' })[0])
  await user.click(categoryComboboxes()[0])
  await user.click(screen.getByRole('button', { name: 'Salary' }))

  await user.click(screen.getAllByRole('button', { name: 'add_category' })[1])
  await user.click(categoryComboboxes()[1])
  await user.click(screen.getByRole('button', { name: 'Groceries' }))

  await user.click(screen.getByRole('button', { name: 'next' }))
  await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_allocation' })).toBeInTheDocument())
}

// A category row is the <li> that contains the category name.
function rowFor(categoryName: string) {
  const name = screen.getByText(categoryName)
  const row = name.closest('li')
  if (!row) throw new Error(`Expected a <li> wrapping "${categoryName}"`)
  return row as HTMLLIElement
}

// A group card is the <section> that contains the group name.
function cardFor(groupName: string) {
  const name = screen.getByText(groupName)
  const card = name.closest('section')
  if (!card) throw new Error(`Expected a <section> wrapping "${groupName}"`)
  return card as HTMLElement
}

async function setAmount(user: ReturnType<typeof userEvent.setup>, categoryName: string, value: number | '') {
  const input = within(rowFor(categoryName)).getByRole('spinbutton')
  await user.clear(input)
  if (value !== '') await user.type(input, String(value))
}

function metricValue(label: string) {
  const dt = screen.getByText(label)
  const row = dt.closest('div')
  if (!row) throw new Error(`Expected a row <div> for "${label}"`)
  return row.querySelector('dd')?.textContent ?? null
}

describe('BudgetAllocationEditor (wizard step 3)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createBudget.mockResolvedValue({ success: true, data: { id: 'budget-1' } })
  })

  it('shows all groups and only their selected categories', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)
    await setUpPlan(user)

    for (const groupName of ['Income', 'Bills', 'Variable Expenses', 'Debt', 'Savings', 'Investments']) {
      expect(screen.getByText(groupName)).toBeInTheDocument()
    }
    expect(screen.getByText('Salary')).toBeInTheDocument()
    expect(screen.getByText('Groceries')).toBeInTheDocument()
    expect(screen.queryByText('Interest')).not.toBeInTheDocument()
    expect(screen.queryByText('Utilities')).not.toBeInTheDocument()
  })

  it('starts every amount at zero', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)
    await setUpPlan(user)

    for (const categoryName of ['Salary', 'Groceries']) {
      expect(within(rowFor(categoryName)).getByRole('spinbutton')).toHaveValue(0)
    }
    expect(within(cardFor('Income')).getByText('$0.00')).toBeInTheDocument()
  })

  it('updates the summary totals when an income amount changes', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)
    await setUpPlan(user)

    await setAmount(user, 'Salary', 1000)

    expect(metricValue('allocation_income')).toBe('$1,000.00')
    expect(metricValue('allocation_assigned')).toBe('$0.00')
    expect(metricValue('allocation_unassigned')).toBe('$1,000.00')
    expect(within(cardFor('Income')).getByText('$1,000.00')).toBeInTheDocument()
  })

  it('updates assigned and unassigned when an outflow amount changes', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)
    await setUpPlan(user)

    await setAmount(user, 'Salary', 1000)
    await setAmount(user, 'Groceries', 400)

    expect(metricValue('allocation_income')).toBe('$1,000.00')
    expect(metricValue('allocation_assigned')).toBe('$400.00')
    expect(metricValue('allocation_unassigned')).toBe('$600.00')
  })

  it('uses total income as the denominator for the progress bars', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)
    await setUpPlan(user)

    await setAmount(user, 'Salary', 1000)
    await setAmount(user, 'Groceries', 250)

    const groceriesBar = within(rowFor('Groceries')).getByRole('progressbar')
    expect(groceriesBar).toHaveAttribute('aria-valuemin', '0')
    expect(groceriesBar).toHaveAttribute('aria-valuemax', '100')
    expect(groceriesBar).toHaveAttribute('aria-valuenow', '25')
    expect(within(rowFor('Groceries')).getByText('25%')).toBeInTheDocument()

    const salaryBar = within(rowFor('Salary')).getByRole('progressbar')
    expect(salaryBar).toHaveAttribute('aria-valuenow', '100')
    expect(within(rowFor('Salary')).getByText('100%')).toBeInTheDocument()
  })

  it('shows the destructive balance state when over-allocated', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)
    await setUpPlan(user)

    await setAmount(user, 'Salary', 1000)
    await setAmount(user, 'Groceries', 1500)

    expect(metricValue('allocation_unassigned')).toBe('-$500.00')
    expect(screen.getByText('balance_negative')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('balance_negative')
  })

  it('does not block submission when over-allocated', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)
    await setUpPlan(user)

    await setAmount(user, 'Salary', 1000)
    await setAmount(user, 'Groceries', 1500)

    await user.click(screen.getByRole('button', { name: 'create_button' }))
    await waitFor(() => expect(mocks.createBudget).toHaveBeenCalledTimes(1))
  })

  it('does not block submission with a positive balance', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)
    await setUpPlan(user)

    await setAmount(user, 'Salary', 1000)
    await setAmount(user, 'Groceries', 400)

    expect(screen.getByText('balance_positive')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'create_button' }))
    await waitFor(() => expect(mocks.createBudget).toHaveBeenCalledTimes(1))
  })

  it('blocks creation when total income is zero and surfaces the error', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)
    await setUpPlan(user)

    await user.click(screen.getByRole('button', { name: 'create_button' }))

    await waitFor(() =>
      expect(screen.getByText('Planned income must be greater than zero')).toBeInTheDocument(),
    )
    expect(mocks.createBudget).not.toHaveBeenCalled()
  })

  it('shows an inline error for a negative amount and does not submit', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)
    await setUpPlan(user)

    const input = within(rowFor('Groceries')).getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '-5' } })

    await user.click(screen.getByRole('button', { name: 'create_button' }))

    await waitFor(() => expect(screen.getByText('Amount must be zero or positive')).toBeInTheDocument())
    expect(mocks.createBudget).not.toHaveBeenCalled()
  })

  it('shows an inline error for an empty amount and does not submit', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)
    await setUpPlan(user)

    await setAmount(user, 'Groceries', '')

    await user.click(screen.getByRole('button', { name: 'create_button' }))

    await waitFor(() => expect(screen.getByText('Amount must be a number')).toBeInTheDocument())
    expect(mocks.createBudget).not.toHaveBeenCalled()
  })

  it('preserves amounts when navigating back to structure and returning', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)
    await setUpPlan(user)

    await setAmount(user, 'Salary', 1000)
    await setAmount(user, 'Groceries', 400)

    await user.click(screen.getByRole('button', { name: 'back' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_structure' })).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'next' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_allocation' })).toBeInTheDocument())

    expect(within(rowFor('Salary')).getByRole('spinbutton')).toHaveValue(1000)
    expect(within(rowFor('Groceries')).getByRole('spinbutton')).toHaveValue(400)
  })

  it('exposes no structural controls in step 3', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)
    await setUpPlan(user)

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'add_category' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'remove_category' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'delete_group' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'create_group' })).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /^group_name / })).not.toBeInTheDocument()
  })
})
