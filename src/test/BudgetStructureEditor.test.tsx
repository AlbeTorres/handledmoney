import type { QuickTarget } from '@/app/(financeapp)/budget/_components/BudgetStructureEditor'
import type { BudgetCategory } from '@/components/CategoryCombobox'
import { createTemplateGroups } from '@/lib/budget-plan-templates'
import type { CreateBudgetValues } from '@/lib/schema'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  back: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  createBudget: vi.fn(),
  lastDrawerProps: { current: null as null | { calculationType?: string } },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: mocks.back, push: mocks.push, refresh: mocks.refresh }),
}))
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, number>) => {
    if (key === 'summary_groups') return `${params?.count ?? 0} groups`
    if (key === 'summary_categories') return `${params?.count ?? 0} categories`
    return key
  },
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@/actions/budget/create-budget', () => ({ createBudgetAction: mocks.createBudget }))
vi.mock('@/components/QuickCreateCategoryDrawer', () => ({
  QuickCreateCategoryDrawer: (props: any) => {
    mocks.lastDrawerProps.current = props
    return (
      <button
        type='button'
        onClick={() =>
          props.onCreated({
            id: '6d1f5e9f-0a4f-4b8e-9a1c-2c3d4e5f6071',
            name: 'Quick category',
            type: props.calculationType === 'income' ? 'income' : 'expense',
            icon: 'tag',
            color: '000000',
          })
        }
      >
        Create quick category
      </button>
    )
  },
}))
vi.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <select
      aria-label='group_type'
      data-slot='select-trigger'
      value={value}
      onChange={event => onValueChange?.(event.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
}))

import { BudgetStructureEditor } from '@/app/(financeapp)/budget/_components/BudgetStructureEditor'
import { CreateBudgetForm } from '@/app/(financeapp)/budget/_components/CreateBudgetForm'

const incomeCategories: BudgetCategory[] = [
  {
    id: '9f7d1f5e-0a4f-4b8e-9a1c-2c3d4e5f6070',
    name: 'Salary',
    type: 'income',
    icon: 'wallet',
    color: '137FEC',
  },
  {
    id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Interest',
    type: 'income',
    icon: 'percent',
    color: 'F59E0B',
  },
]
const expenseCategories: BudgetCategory[] = [
  {
    id: 'b6a5f1d0-1a2b-4c3d-8e9f-0a1b2c3d4e5f',
    name: 'Groceries',
    type: 'expense',
    icon: 'cart',
    color: '22C55E',
  },
  {
    id: 'c7d8e9f0-2b3c-4d5e-9a8b-1c2d3e4f5060',
    name: 'Utilities',
    type: 'expense',
    icon: 'zap',
    color: '3B82F6',
  },
]
const allCategories = [...incomeCategories, ...expenseCategories]

// The inline create-group input has the exact label `group_name`; each group card
// name input is labelled `group_name <current name>` so cards are matched with a
// trailing-space regex.
function groupNameInputs() {
  return screen.getAllByRole('textbox', { name: /^group_name / })
}

function incomeNameInput() {
  return groupNameInputs()[0]
}

function categoryComboboxes() {
  return screen
    .getAllByRole('combobox')
    .filter(element => element.getAttribute('data-slot') !== 'select-trigger')
}

function renderEditor(
  initialGroups: CreateBudgetValues['groups'],
  options: { onRequestQuickCreate?: (target: QuickTarget) => void } = {},
) {
  const formRef: { current: UseFormReturn<CreateBudgetValues> | null } = { current: null }
  const onRequestQuickCreate = options.onRequestQuickCreate ?? vi.fn()
  function Wrapper() {
    const form = useForm<CreateBudgetValues>({ defaultValues: { groups: initialGroups } })
    useEffect(() => {
      formRef.current = form
    })
    return (
      <BudgetStructureEditor
        form={form}
        categories={allCategories}
        onRequestQuickCreate={onRequestQuickCreate}
      />
    )
  }
  render(<Wrapper />)
  return { form: formRef.current!, onRequestQuickCreate }
}

async function openCreateGroupForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'create_group' }))
}

async function selectGroupType(
  user: ReturnType<typeof userEvent.setup>,
  type: 'income' | 'outflow',
) {
  await user.selectOptions(screen.getByRole('combobox', { name: 'group_type' }), type)
}

describe('BudgetStructureEditor', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders six group cards from the starter template', () => {
    renderEditor(createTemplateGroups('starter'))
    expect(groupNameInputs()).toHaveLength(6)
    expect(incomeNameInput()).toHaveValue('Income')
  })

  it('renders exactly one Income group card from the blank template', () => {
    renderEditor(createTemplateGroups('blank'))
    expect(groupNameInputs()).toHaveLength(1)
    expect(incomeNameInput()).toHaveValue('Income')
  })

  it('disables deletion of the only income group', () => {
    renderEditor(createTemplateGroups('blank'))
    const deleteButton = screen.getByRole('button', { name: 'delete_group' })
    expect(deleteButton).toBeDisabled()
    expect(deleteButton).toHaveAttribute('title', 'income_group_required')
  })

  it('adds a second income group through the inline form', async () => {
    const user = userEvent.setup()
    const { form } = renderEditor(createTemplateGroups('blank'))
    await openCreateGroupForm(user)
    await user.type(screen.getByLabelText('group_name'), 'Salary')
    await selectGroupType(user, 'income')
    await user.click(screen.getByRole('button', { name: 'add_group' }))
    const groups = form.getValues('groups')
    expect(groups).toHaveLength(2)
    expect(groups[1]).toMatchObject({
      name: 'Salary',
      calculationType: 'income',
      sortOrder: 1,
      items: [],
    })
  })

  it('allows deleting an income group when another income group remains', async () => {
    const user = userEvent.setup()
    const { form } = renderEditor(createTemplateGroups('blank'))
    await openCreateGroupForm(user)
    await user.type(screen.getByLabelText('group_name'), 'Salary')
    await selectGroupType(user, 'income')
    await user.click(screen.getByRole('button', { name: 'add_group' }))

    await user.click(screen.getAllByRole('button', { name: 'delete_group' })[0])
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirm' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    const groups = form.getValues('groups')
    expect(groups).toHaveLength(1)
    expect(groups[0]).toMatchObject({ name: 'Salary', calculationType: 'income', sortOrder: 1 })
  })

  it('assigns the next sortOrder to a newly created outflow group', async () => {
    const user = userEvent.setup()
    const { form } = renderEditor(createTemplateGroups('starter'))
    await openCreateGroupForm(user)
    await user.type(screen.getByLabelText('group_name'), 'Travel')
    await user.click(screen.getByRole('button', { name: 'add_group' }))
    const groups = form.getValues('groups')
    expect(groups).toHaveLength(7)
    expect(groups.map(group => group.name)).toEqual([
      'Income',
      'Bills',
      'Variable Expenses',
      'Debt',
      'Savings',
      'Investments',
      'Travel',
    ])
    expect(groups.map(group => group.sortOrder)).toEqual([0, 1, 2, 3, 4, 5, 6])
    expect(groups[6].calculationType).toBe('outflow')
  })

  it('appends a zero-amount item when adding a category to a group', async () => {
    const user = userEvent.setup()
    const { form } = renderEditor(createTemplateGroups('starter'))
    await user.click(screen.getAllByRole('button', { name: 'add_category' })[0])
    const items = form.getValues('groups')[0].items
    expect(items).toHaveLength(1)
    expect(items[0]).toEqual({ categoryId: '', plannedAmount: 0 })
  })

  it('renders no amount or number inputs in the structure step', () => {
    renderEditor(createTemplateGroups('starter'))
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('amount')).not.toBeInTheDocument()
  })

  it('requests a quick create for the correct row and group type', async () => {
    const user = userEvent.setup()
    const onRequestQuickCreate = vi.fn()
    renderEditor(createTemplateGroups('starter'), { onRequestQuickCreate })
    await user.click(screen.getAllByRole('button', { name: 'add_category' })[0])
    await user.click(categoryComboboxes()[0])
    await user.type(screen.getByPlaceholderText('category_search'), 'Contract')
    await user.click(screen.getByRole('button', { name: 'create_category' }))
    expect(onRequestQuickCreate).toHaveBeenCalledWith({
      groupIndex: 0,
      itemIndex: 0,
      calculationType: 'income',
      name: 'Contract',
    })
  })

  it('filters incompatible categories per group type in the combobox', async () => {
    const user = userEvent.setup()
    renderEditor(createTemplateGroups('blank'))
    await user.click(screen.getAllByRole('button', { name: 'add_category' })[0])
    await user.click(categoryComboboxes()[0])
    expect(screen.getByRole('button', { name: 'Salary' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Groceries' })).not.toBeInTheDocument()
  })

  it('prevents selecting the same category in two rows', async () => {
    const user = userEvent.setup()
    renderEditor(createTemplateGroups('blank'))
    const addCategory = screen.getAllByRole('button', { name: 'add_category' })[0]
    await user.click(addCategory)
    await user.click(addCategory)
    await user.click(categoryComboboxes()[0])
    await user.click(screen.getByRole('button', { name: 'Salary' }))

    await user.click(categoryComboboxes()[1])
    expect(screen.queryByRole('button', { name: 'Salary' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Interest' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Interest' }))

    await user.click(categoryComboboxes()[0])
    expect(screen.getByRole('button', { name: 'Salary' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Interest' })).not.toBeInTheDocument()
  })

  it('resets the planned amount to zero when the category changes in step 2', async () => {
    const user = userEvent.setup()
    const { form } = renderEditor([
      {
        name: 'Income',
        calculationType: 'income',
        sortOrder: 0,
        items: [{ categoryId: '9f7d1f5e-0a4f-4b8e-9a1c-2c3d4e5f6070', plannedAmount: 500 }],
      },
    ])

    await user.click(categoryComboboxes()[0])
    await user.click(screen.getByRole('button', { name: 'Interest' }))

    const items = form.getValues('groups')[0].items
    expect(items[0]).toEqual({
      categoryId: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
      plannedAmount: 0,
    })
  })

  it('summarizes group count, category count and income readiness', async () => {
    const user = userEvent.setup()
    renderEditor(createTemplateGroups('starter'))
    expect(screen.getByText('6 groups')).toBeInTheDocument()
    expect(screen.getByText('0 categories')).toBeInTheDocument()
    expect(screen.getByText('summary_income_pending')).toBeInTheDocument()

    const addCategory = screen.getAllByRole('button', { name: 'add_category' })[0]
    await user.click(addCategory)
    await user.click(addCategory)
    await user.click(categoryComboboxes()[0])
    await user.click(screen.getByRole('button', { name: 'Salary' }))

    expect(screen.getByText('6 groups')).toBeInTheDocument()
    expect(screen.getByText('1 categories')).toBeInTheDocument()
    expect(screen.getByText('summary_income_ready')).toBeInTheDocument()
  })
})

describe('structure-to-allocation gate in the wizard', () => {
  beforeEach(() => vi.clearAllMocks())

  async function goToStructure(user: ReturnType<typeof userEvent.setup>, name = 'August') {
    await user.type(screen.getByLabelText('name'), name)
    await user.click(screen.getByRole('button', { name: 'next' }))
  }

  it('blocks advancing when the income group has no selected category', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)
    await goToStructure(user)

    await user.click(screen.getByRole('button', { name: 'next' }))

    expect(screen.getByText('Add at least one income group with a category')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'heading_structure' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'heading_allocation' })).not.toBeInTheDocument()
  })

  it('blocks advancing when an income row has no category and shows the row error', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)
    await goToStructure(user)
    await user.click(screen.getAllByRole('button', { name: 'add_category' })[0])

    await user.click(screen.getByRole('button', { name: 'next' }))

    expect(screen.getByText('Select a category')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'heading_structure' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'heading_allocation' })).not.toBeInTheDocument()
  })

  it('advances to allocation once an income category is selected and clears the error', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)
    await goToStructure(user)
    await user.click(screen.getAllByRole('button', { name: 'add_category' })[0])

    await user.click(screen.getByRole('button', { name: 'next' }))
    expect(screen.getByText('Select a category')).toBeInTheDocument()

    await user.click(categoryComboboxes()[0])
    await user.click(screen.getByRole('button', { name: 'Salary' }))
    expect(screen.queryByText('Select a category')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'next' }))

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'heading_allocation' })).toBeInTheDocument(),
    )
  })

  it('does not block advancing on empty outflow groups', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)
    await goToStructure(user)
    await user.click(screen.getAllByRole('button', { name: 'add_category' })[0])
    await user.click(categoryComboboxes()[0])
    await user.click(screen.getByRole('button', { name: 'Salary' }))

    await user.click(screen.getByRole('button', { name: 'next' }))

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'heading_allocation' })).toBeInTheDocument(),
    )
  })

  it('quick-create selects the created category in the target income row', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)
    await goToStructure(user)
    await user.click(screen.getAllByRole('button', { name: 'add_category' })[0])
    await user.click(categoryComboboxes()[0])
    await user.click(screen.getByRole('button', { name: 'create_category' }))
    await user.click(screen.getByRole('button', { name: 'Create quick category' }))

    expect(categoryComboboxes()[0]).toHaveTextContent('Quick category')

    await user.click(screen.getByRole('button', { name: 'next' }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'heading_allocation' })).toBeInTheDocument(),
    )
  })

  it('targets quick-created categories with the group type respected', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)
    await goToStructure(user)
    await user.click(screen.getAllByRole('button', { name: 'add_category' })[0])
    await user.click(categoryComboboxes()[0])
    await user.click(screen.getByRole('button', { name: 'create_category' }))

    expect(mocks.lastDrawerProps.current?.calculationType).toBe('income')
  })

  it('renders no amount or number inputs in the structure step of the wizard', async () => {
    const user = userEvent.setup()
    render(<CreateBudgetForm initialCategories={allCategories} />)
    await goToStructure(user)

    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('amount')).not.toBeInTheDocument()
  })
})
