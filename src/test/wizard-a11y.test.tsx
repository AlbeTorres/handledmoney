import { render, screen, waitFor } from '@testing-library/react'
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
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@/actions/budget/create-budget', () => ({ createBudgetAction: mocks.createBudget }))
vi.mock('@/components/QuickCreateCategoryDrawer', () => ({ QuickCreateCategoryDrawer: () => null }))

import { CreateBudgetForm } from '@/components/CreateBudgetForm'
import { FormWrapper } from '@/components/FormWrapper'

const incomeCategories: BudgetCategory[] = [
  { id: '9f7d1f5e-0a4f-4b8e-9a1c-2c3d4e5f6070', name: 'Salary', type: 'income', icon: 'wallet', color: '137FEC' },
  { id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', name: 'Interest', type: 'income', icon: 'percent', color: 'F59E0B' },
]
const expenseCategories: BudgetCategory[] = [
  { id: 'b6a5f1d0-1a2b-4c3d-8e9f-0a1b2c3d4e5f', name: 'Groceries', type: 'expense', icon: 'cart', color: '22C55E' },
  { id: 'c7d8e9f0-2b3c-4d5e-9a8b-1c2d3e4f5060', name: 'Utilities', type: 'expense', icon: 'zap', color: '3B82F6' },
]
const allCategories = [...incomeCategories, ...expenseCategories]

// The create page composes the FormWrapper (which owns the page h1) with the
// wizard, so the a11y assertions run against the real page shell.
function renderPage() {
  return render(
    <FormWrapper
      title='Create budget'
      description='Define your budget and allocation plan before saving.'
      oldPath='/budget'
      oldPathTitle='Budgets'
      pathTitle='Create'
    >
      <CreateBudgetForm initialCategories={allCategories} />
    </FormWrapper>,
  )
}

async function goToStructure(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('name'), 'August')
  await user.click(screen.getByRole('button', { name: 'next' }))
}

async function goToAllocation(user: ReturnType<typeof userEvent.setup>) {
  await goToStructure(user)
  await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_structure' })).toBeInTheDocument())
  await user.click(screen.getAllByRole('button', { name: 'add_category' })[0])
  await user.click(categoryComboboxes()[0])
  await user.click(screen.getByRole('button', { name: 'Salary' }))
  await user.click(screen.getByRole('button', { name: 'next' }))
}

function categoryComboboxes() {
  return screen.queryAllByRole('combobox').filter(element => element.getAttribute('data-slot') !== 'select-trigger')
}

// The wizard form sits inside the FormWrapper container, not in a portal.
function wizardForm() {
  const form = document.querySelector('form')
  if (!form) throw new Error('Expected the wizard <form> to be rendered')
  return form
}

// Every element of `role` must expose a non-empty accessible name, so a screen
// reader never meets an anonymous control (WCAG 4.1.2).
function assertEveryControlHasAName(roles: string[]) {
  for (const role of roles) {
    const all = screen.queryAllByRole(role)
    const named = screen.queryAllByRole(role, { name: /.+/ })
    expect(named, `expected every ${role} to have an accessible name`).toHaveLength(all.length)
  }
}

// Heading levels must never skip: h1 owns the page, step headings are h2, and
// group/summary headings are h3. A jump of more than one level is a defect.
function assertNoSkippedHeadings() {
  const headings = screen.getAllByRole('heading')
  const h1s = headings.filter(heading => heading.tagName === 'H1')
  expect(h1s).toHaveLength(1)
  const levels = headings.map(heading => Number(heading.tagName.slice(1)))
  levels.forEach((level, index) => {
    if (index === 0) {
      expect(level).toBe(1)
    } else if (level > levels[index - 1]) {
      expect(level).toBe(levels[index - 1] + 1)
    }
  })
}

describe('budget wizard accessibility', () => {
  beforeEach(() => vi.clearAllMocks())

  it('exposes exactly one h1 and never skips heading levels across all three steps', async () => {
    const user = userEvent.setup()
    renderPage()

    assertNoSkippedHeadings()

    await goToStructure(user)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_structure' })).toBeInTheDocument())
    assertNoSkippedHeadings()

    await user.click(screen.getAllByRole('button', { name: 'add_category' })[0])
    await user.click(categoryComboboxes()[0])
    await user.click(screen.getByRole('button', { name: 'Salary' }))
    await user.click(screen.getByRole('button', { name: 'next' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_allocation' })).toBeInTheDocument())
    assertNoSkippedHeadings()
  })

  it('gives every interactive control an accessible name on every step', async () => {
    const user = userEvent.setup()
    renderPage()

    assertEveryControlHasAName(['button', 'textbox', 'radio'])

    await goToStructure(user)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_structure' })).toBeInTheDocument())
    assertEveryControlHasAName(['button', 'textbox', 'combobox'])

    // Open the first category combobox: the search input and the option and
    // create buttons inside the popover must be named too.
    await user.click(screen.getAllByRole('button', { name: 'add_category' })[0])
    await user.click(categoryComboboxes()[0])
    assertEveryControlHasAName(['button', 'textbox', 'combobox'])

    await user.click(screen.getByRole('button', { name: 'Salary' }))
    await user.click(screen.getByRole('button', { name: 'next' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_allocation' })).toBeInTheDocument())
    assertEveryControlHasAName(['button', 'spinbutton'])
  })

  it('labels the category search input and the group-type select explicitly', async () => {
    const user = userEvent.setup()
    renderPage()

    await goToStructure(user)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_structure' })).toBeInTheDocument())

    await user.click(screen.getAllByRole('button', { name: 'add_category' })[0])
    await user.click(categoryComboboxes()[0])

    // The search input must carry an aria-label, not rely on its placeholder.
    const search = screen.getByPlaceholderText('category_search')
    expect(search).toHaveAttribute('aria-label', 'category_search')

    // The group-type select must be reachable by its field label, not by the
    // currently selected value.
    await user.click(screen.getByRole('button', { name: 'create_group' }))
    expect(screen.getByRole('combobox', { name: 'group_type' })).toBeInTheDocument()
  })

  it('keeps a visible keyboard focus indicator on the inline group-name input', async () => {
    const user = userEvent.setup()
    renderPage()

    await goToStructure(user)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_structure' })).toBeInTheDocument())

    const groupNameInput = screen.getAllByRole('textbox', { name: /^group_name / })[0]
    expect(groupNameInput.className).not.toMatch(/focus-visible:ring-0/)
  })

  it('exposes aria-valuenow on every allocation progress bar', async () => {
    const user = userEvent.setup()
    renderPage()

    await goToAllocation(user)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'heading_allocation' })).toBeInTheDocument())

    const bars = screen.getAllByRole('progressbar')
    expect(bars.length).toBeGreaterThan(0)
    for (const bar of bars) {
      expect(bar).toHaveAttribute('aria-valuemin', '0')
      expect(bar).toHaveAttribute('aria-valuemax', '100')
      expect(bar).toHaveAttribute('aria-valuenow')
    }
  })

  it('disables native form validation so react-hook-form errors surface inline', () => {
    renderPage()
    expect(wizardForm()).toHaveAttribute('novalidate')
  })
})
