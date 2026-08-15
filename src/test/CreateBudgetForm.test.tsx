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
vi.mock('@/components/QuickCreateCategoryDrawer', () => ({
  QuickCreateCategoryDrawer: ({ onCreated }: { onCreated: (category: BudgetCategory) => void }) => (
    <button
      type='button'
      onClick={() => onCreated({ id: '6d1f5e9f-0a4f-4b8e-9a1c-2c3d4e5f6071', name: 'Quick category', type: 'expense', icon: 'tag', color: '000000' })}
    >
      Create quick category
    </button>
  ),
}))

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

// Stepper labels render inside the labelled nav; the setup heading also shows
// step_setup as text, so scope these lookups to the stepper nav.
function stepperItem(name: string) {
  const item = within(screen.getByRole('navigation', { name: 'steps_label' })).getByText(name).closest('li')
  if (!item) throw new Error(`Expected a <li> wrapping the "${name}" stepper label`)
  return item as HTMLLIElement
}

async function goToStructure(user: ReturnType<typeof userEvent.setup>, name = 'August') {
  await user.type(screen.getByLabelText('name'), name)
  await user.click(screen.getByRole('button', { name: 'next' }))
}

async function goToAllocation(user: ReturnType<typeof userEvent.setup>, name = 'August') {
  await goToStructure(user, name)
  await addCategoryToIncomeGroup(user)
  await selectCategory(user, 0, 'Salary')
  await user.click(screen.getByRole('button', { name: 'next' }))
}

// Each group card name input is labelled `group_name <current name>`; the inline
// create-group input has the exact label `group_name`. Cards are matched with a
// trailing-space regex, so index 0 is the first group card (the Income group).
function groupNameInputs() {
  return screen.getAllByRole('textbox', { name: /^group_name / })
}

async function renameIncomeGroup(user: ReturnType<typeof userEvent.setup>, to = 'Salary Income') {
  const income = groupNameInputs()[0]
  await user.clear(income)
  await user.type(income, to)
}

async function addCategoryToIncomeGroup(user: ReturnType<typeof userEvent.setup>, times = 1) {
  const addCategory = screen.getAllByRole('button', { name: 'add_category' })[0]
  for (let i = 0; i < times; i += 1) await user.click(addCategory)
}

function categoryComboboxes() {
  return screen.queryAllByRole('combobox').filter(element => element.getAttribute('data-slot') !== 'select-trigger')
}

async function selectCategory(user: ReturnType<typeof userEvent.setup>, comboboxIndex: number, categoryName: string) {
  const combobox = categoryComboboxes()[comboboxIndex]
  await user.click(combobox)
  await user.click(screen.getByRole('button', { name: categoryName }))
}

// A category row on the allocation step is the <li> that contains the category name.
function rowFor(categoryName: string) {
  const name = screen.getByText(categoryName)
  const row = name.closest('li')
  if (!row) throw new Error(`Expected a <li> wrapping "${categoryName}"`)
  return row as HTMLLIElement
}

async function setAmount(user: ReturnType<typeof userEvent.setup>, categoryName: string, value: number) {
  const input = within(rowFor(categoryName)).getByRole('spinbutton')
  await user.clear(input)
  await user.type(input, String(value))
}

// A summary metric value is the <dd> in the same row <div> as its <dt> label.
function metricValue(label: string) {
  const dt = screen.getByText(label)
  const row = dt.closest('div')
  if (!row) throw new Error(`Expected a row <div> for "${label}"`)
  return row.querySelector('dd')?.textContent ?? null
}

describe('CreateBudgetForm wizard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('blocks Next until required metadata is valid and focuses the invalid field', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={[]} />)

    await user.click(screen.getByRole('button', { name: 'next' }))

    await waitFor(() => expect(screen.getByLabelText('name')).toHaveAttribute('aria-invalid', 'true'))
    expect(screen.getByLabelText('name')).toHaveFocus()
    expect(screen.queryByRole('heading', { name: 'heading_structure' })).not.toBeInTheDocument()
  })

  it('starts with the starter template and retains a real group rename through Back and Next', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)

    expect(screen.getByRole('radio', { name: 'template_starter' })).toBeChecked()
    await goToStructure(user)

    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_structure' })).toHaveFocus())

    await renameIncomeGroup(user, 'Salary Income')
    await user.click(screen.getByRole('button', { name: 'back' }))
    await user.click(screen.getByRole('button', { name: 'next' }))

    await waitFor(() => expect(groupNameInputs()[0]).toHaveValue('Salary Income'))
  })

  it('shows blank-plan guidance on setup, keeps quick-created categories outside replacement, and enables creation on the allocation step', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)

    await user.click(screen.getByRole('radio', { name: 'template_blank' }))
    expect(screen.getByText('template_info_blank')).toBeInTheDocument()

    await user.type(screen.getByLabelText('name'), 'August')
    await user.click(screen.getByRole('button', { name: 'next' }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_structure' })).toBeInTheDocument())
    expect(groupNameInputs()).toHaveLength(1)
    expect(groupNameInputs()[0]).toHaveValue('Income')

    await user.click(screen.getByRole('button', { name: 'create_group' }))
    await user.type(screen.getByLabelText('group_name'), 'Groceries')
    await user.click(screen.getByRole('button', { name: 'add_group' }))

    await user.click(screen.getAllByRole('button', { name: 'add_category' })[0])
    await user.click(categoryComboboxes()[0])
    await user.click(screen.getByRole('button', { name: 'Salary' }))

    await user.click(screen.getAllByRole('button', { name: 'add_category' })[1])
    await user.click(categoryComboboxes()[1])
    await user.click(screen.getByRole('button', { name: 'create_category' }))
    await user.click(screen.getByRole('button', { name: 'Create quick category' }))

    expect(categoryComboboxes()[1]).toHaveTextContent('Quick category')

    await user.click(screen.getByRole('button', { name: 'next' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_allocation' })).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'create_button' })).toBeEnabled()
  })

  it('moves the stepper aria-current and focuses each step heading as the wizard advances and goes back', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)

    expect(stepperItem('step_setup')).toHaveAttribute('aria-current', 'step')

    await goToStructure(user)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_structure' })).toHaveFocus())
    expect(stepperItem('step_structure')).toHaveAttribute('aria-current', 'step')
    expect(stepperItem('step_setup')).not.toHaveAttribute('aria-current')

    await addCategoryToIncomeGroup(user)
    await selectCategory(user, 0, 'Salary')
    await user.click(screen.getByRole('button', { name: 'next' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_allocation' })).toHaveFocus())
    expect(stepperItem('step_allocation')).toHaveAttribute('aria-current', 'step')

    await user.click(screen.getByRole('button', { name: 'back' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_structure' })).toHaveFocus())
    expect(stepperItem('step_structure')).toHaveAttribute('aria-current', 'step')
  })

  it('preserves plan edits when navigating back from allocation to structure', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)

    await goToAllocation(user)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_allocation' })).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'back' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_structure' })).toBeInTheDocument())
    expect(groupNameInputs()[0]).toHaveValue('Income')
  })

  it('resets an assigned amount when its category changes in step 2', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)

    await goToAllocation(user)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_allocation' })).toBeInTheDocument())
    await setAmount(user, 'Salary', 500)

    await user.click(screen.getByRole('button', { name: 'back' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_structure' })).toBeInTheDocument())

    await user.click(categoryComboboxes()[0])
    await user.click(screen.getByRole('button', { name: 'Interest' }))

    await user.click(screen.getByRole('button', { name: 'next' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_allocation' })).toBeInTheDocument())

    expect(screen.queryByText('Salary')).not.toBeInTheDocument()
    expect(within(rowFor('Interest')).getByRole('spinbutton')).toHaveValue(0)
  })

  it('shows the template info panel matching the selected template', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)

    expect(screen.getByText('template_info_starter')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'template_blank' }))
    expect(screen.getByText('template_info_blank')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'template_starter' }))
    expect(screen.getByText('template_info_starter')).toBeInTheDocument()
  })

  it('does not confirm when changing the template before editing the plan', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)

    await user.click(screen.getByRole('radio', { name: 'template_blank' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'template_blank' })).toBeChecked()
  })

  it('does not confirm when selecting the already-selected template', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)

    await goToStructure(user)
    await renameIncomeGroup(user)
    await user.click(screen.getByRole('button', { name: 'back' }))

    await user.click(screen.getByRole('radio', { name: 'template_starter' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'template_starter' })).toBeChecked()
  })

  it('does not confirm again when the plan is reverted to the committed baseline', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)

    await goToStructure(user)
    await renameIncomeGroup(user)
    await user.click(screen.getByRole('button', { name: 'back' }))

    await user.click(screen.getByRole('radio', { name: 'template_blank' }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'template_replace_confirm' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'next' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_structure' })).toBeInTheDocument())
    await renameIncomeGroup(user, 'Temporary')
    await renameIncomeGroup(user, 'Income')
    await user.click(screen.getByRole('button', { name: 'back' }))

    await user.click(screen.getByRole('radio', { name: 'template_starter' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'template_starter' })).toBeChecked()
  })

  it('keeps a quick-created category selectable after confirming a template replacement', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)

    await goToStructure(user)
    await addCategoryToIncomeGroup(user)
    await user.click(categoryComboboxes()[0])
    await user.click(screen.getByRole('button', { name: 'create_category' }))
    await user.click(screen.getByRole('button', { name: 'Create quick category' }))
    expect(categoryComboboxes()[0]).toHaveTextContent('Quick category')

    await user.click(screen.getByRole('button', { name: 'back' }))
    await user.click(screen.getByRole('radio', { name: 'template_blank' }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'template_replace_confirm' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'next' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_structure' })).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'create_group' }))
    await user.type(screen.getByLabelText('group_name'), 'Groceries')
    await user.click(screen.getByRole('button', { name: 'add_group' }))
    await user.click(screen.getAllByRole('button', { name: 'add_category' })[1])
    await user.click(categoryComboboxes()[0])

    expect(screen.getByRole('button', { name: 'Quick category' })).toBeInTheDocument()
  })

  it('prompts to confirm before replacing a plan after renaming a real group', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)

    await goToStructure(user)
    await renameIncomeGroup(user)
    await user.click(screen.getByRole('button', { name: 'back' }))

    await user.click(screen.getByRole('radio', { name: 'template_blank' }))

    const dialog = await waitFor(() => {
      const found = screen.getByRole('dialog')
      expect(within(found).getByRole('heading', { name: 'template_replace_title' })).toBeInTheDocument()
      expect(within(found).getByText('template_replace_description')).toBeInTheDocument()
      expect(within(found).getByRole('button', { name: 'template_replace_confirm' })).toBeInTheDocument()
      expect(within(found).getByRole('button', { name: 'template_replace_cancel' })).toBeInTheDocument()
      return found
    })
    expect(dialog).toBeInTheDocument()
  })

  it('prompts to confirm before replacing a plan after adding a real category', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)

    await goToStructure(user)
    await addCategoryToIncomeGroup(user)
    await selectCategory(user, 0, 'Salary')
    await user.click(screen.getByRole('button', { name: 'back' }))

    await user.click(screen.getByRole('radio', { name: 'template_blank' }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(within(screen.getByRole('dialog')).getByRole('heading', { name: 'template_replace_title' })).toBeInTheDocument()
    })
  })

  it('prompts to confirm before replacing a plan after removing a category', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)

    await goToStructure(user)
    await addCategoryToIncomeGroup(user, 2)
    await selectCategory(user, 0, 'Salary')
    await selectCategory(user, 1, 'Interest')

    await user.click(screen.getAllByRole('button', { name: 'remove_category' })[1])
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirm' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'back' }))
    await user.click(screen.getByRole('radio', { name: 'template_blank' }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(within(screen.getByRole('dialog')).getByRole('heading', { name: 'template_replace_title' })).toBeInTheDocument()
    })
  })

  it('does not prompt when only budget metadata changed', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)

    await goToStructure(user)
    await user.click(screen.getByRole('button', { name: 'back' }))
    await user.type(screen.getByLabelText('name'), ' Renamed')

    await user.click(screen.getByRole('radio', { name: 'template_blank' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'template_blank' })).toBeChecked()
  })

  it('cancel on the confirmation keeps the template and the full plan unchanged', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)

    await goToStructure(user)
    await renameIncomeGroup(user)
    await user.click(screen.getByRole('button', { name: 'back' }))

    await user.click(screen.getByRole('radio', { name: 'template_blank' }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'template_replace_cancel' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    expect(screen.getByRole('radio', { name: 'template_starter' })).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'next' }))
    await waitFor(() => expect(groupNameInputs()[0]).toHaveValue('Salary Income'))
  })

  it('confirm on the confirmation replaces the plan with the new template baseline', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)

    await goToStructure(user)
    await renameIncomeGroup(user)
    await user.click(screen.getByRole('button', { name: 'back' }))

    await user.click(screen.getByRole('radio', { name: 'template_blank' }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'template_replace_confirm' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    expect(screen.getByRole('radio', { name: 'template_blank' })).toBeChecked()
    expect(screen.getByText('template_info_blank')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'next' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_structure' })).toBeInTheDocument())
    await addCategoryToIncomeGroup(user)
    await selectCategory(user, 0, 'Salary')
    await user.click(screen.getByRole('button', { name: 'next' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_allocation' })).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'create_button' })).toBeEnabled()
  })

  it('drives the full budget creation journey end-to-end with real components', async () => {
    mocks.createBudget.mockResolvedValue({ success: true, data: { id: 'budget-1' } })
    const salaryId = incomeCategories[0].id
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)

    // Starter template is preselected on step 1.
    expect(screen.getByRole('radio', { name: 'template_starter' })).toBeChecked()

    // Step 1: fill metadata (name + month/year) and continue to step 2.
    await user.type(screen.getByLabelText('name'), 'August')
    fireEvent.change(screen.getByLabelText('start_date'), { target: { value: '2026-08-01' } })
    fireEvent.change(screen.getByLabelText('end_date'), { target: { value: '2026-08-31' } })
    await user.click(screen.getByRole('button', { name: 'next' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_structure' })).toBeInTheDocument())

    // The Income group appears among the six template groups.
    expect(groupNameInputs()).toHaveLength(6)
    // Step 2: add an income category and a brand-new outflow group with a category.
    await addCategoryToIncomeGroup(user)
    await selectCategory(user, 0, 'Salary')
    await user.click(screen.getByRole('button', { name: 'create_group' }))
    await user.type(screen.getByLabelText('group_name'), 'Food')
    await user.click(screen.getByRole('button', { name: 'add_group' }))
    await user.click(screen.getAllByRole('button', { name: 'add_category' })[6])
    await selectCategory(user, 1, 'Groceries')

    // Step 3: amounts start at zero.
    await user.click(screen.getByRole('button', { name: 'next' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_allocation' })).toBeInTheDocument())
    expect(within(rowFor('Salary')).getByRole('spinbutton')).toHaveValue(0)
    expect(within(rowFor('Groceries')).getByRole('spinbutton')).toHaveValue(0)

    // Assign amounts: income 1000, outflow 700 -> unassigned 300 shown in amber.
    await setAmount(user, 'Salary', 1000)
    await setAmount(user, 'Groceries', 700)
    expect(metricValue('allocation_unassigned')).toBe('$300.00')
    expect(screen.getByText('balance_positive')).toHaveClass('bg-amber-500/10')

    // Back to step 2 and forward again: assigned amounts are preserved.
    await user.click(screen.getByRole('button', { name: 'back' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_structure' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'next' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_allocation' })).toBeInTheDocument())
    expect(within(rowFor('Salary')).getByRole('spinbutton')).toHaveValue(1000)
    expect(within(rowFor('Groceries')).getByRole('spinbutton')).toHaveValue(700)

    // Back to step 1 and pick BLANK: confirmation appears, CANCEL keeps starter.
    await user.click(screen.getByRole('button', { name: 'back' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_structure' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'back' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'step_setup' })).toBeInTheDocument())
    await user.click(screen.getByRole('radio', { name: 'template_blank' }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'template_replace_cancel' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByRole('radio', { name: 'template_starter' })).toBeChecked()

    // Re-enter step 2: the plan was NOT wiped (income category and new group remain).
    await user.click(screen.getByRole('button', { name: 'next' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_structure' })).toBeInTheDocument())
    expect(groupNameInputs()).toHaveLength(7)
    expect(categoryComboboxes()[0]).toHaveTextContent('Salary')

    // Back to step 1, pick BLANK again, CONFIRM: rebuild to the mandatory Income group.
    await user.click(screen.getByRole('button', { name: 'back' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'step_setup' })).toBeInTheDocument())
    await user.click(screen.getByRole('radio', { name: 'template_blank' }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'template_replace_confirm' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByRole('radio', { name: 'template_blank' })).toBeChecked()

    // The rebuilt plan has just the Income group and no categories.
    await user.click(screen.getByRole('button', { name: 'next' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_structure' })).toBeInTheDocument())
    expect(groupNameInputs()).toHaveLength(1)
    expect(categoryComboboxes()).toHaveLength(0)

    // Rebuild: add the income category, assign its amount, and submit.
    await addCategoryToIncomeGroup(user)
    await selectCategory(user, 0, 'Salary')
    await user.click(screen.getByRole('button', { name: 'next' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_allocation' })).toBeInTheDocument())
    await setAmount(user, 'Salary', 1000)
    await user.click(screen.getByRole('button', { name: 'create_button' }))

    // The submit payload matches the rebuilt plan: metadata + one income group.
    await waitFor(() => expect(mocks.createBudget).toHaveBeenCalledTimes(1))
    const payload = mocks.createBudget.mock.calls[0][0]
    expect(payload.name).toBe('August')
    expect(payload.startDate.getTime()).toBe(new Date('2026-08-01T00:00:00').getTime())
    expect(payload.endDate.getTime()).toBe(new Date('2026-08-31T00:00:00').getTime())
    expect(payload.groups).toHaveLength(1)
    expect(payload.groups[0]).toMatchObject({
      name: 'Income',
      calculationType: 'income',
      sortOrder: 0,
      items: [{ categoryId: salaryId, plannedAmount: 1000 }],
    })
    for (const group of payload.groups) {
      for (const item of group.items) expect(item.categoryId).not.toBe('')
    }

    // Success navigation after the action resolves.
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/budget/budget-1'))
    expect(mocks.refresh).toHaveBeenCalled()
  })
})
