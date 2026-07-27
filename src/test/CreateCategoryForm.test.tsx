import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateCategoryForm } from '@/components/CreateCategoryForm'

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const {
  pushMock,
  backMock,
  refreshMock,
  toastSuccessMock,
  toastErrorMock,
  createCategoryActionMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  backMock: vi.fn(),
  refreshMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
  createCategoryActionMock: vi.fn(),
}))

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    back: backMock,
    refresh: refreshMock,
  }),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('sonner', () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}))

vi.mock('@/actions/category/create-category', () => ({
  createCategoryAction: createCategoryActionMock,
}))

vi.mock('@/components/AppearanceSection', () => ({
  AppearanceSection: () => <div data-testid='appearance-section' />,
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const setup = () => {
  const user = userEvent.setup()
  render(<CreateCategoryForm />)
  return { user }
}

// ── Section: Rendering ────────────────────────────────────────────────────────

describe('CreateCategoryForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form with name input and type toggle buttons', () => {
    setup()

    expect(screen.getByLabelText('form.category_name')).toBeInTheDocument()
    expect(screen.getByText('form.type_expense')).toBeInTheDocument()
    expect(screen.getByText('form.type_income')).toBeInTheDocument()
  })

  it('shows expense button as selected by default', () => {
    setup()

    const expenseButton = screen.getByText('form.type_expense')
    // The selected button gets the bg-white class indicating active state
    expect(expenseButton.className).toContain('bg-white')
  })

  // ── Section: Type toggle ────────────────────────────────────────────────────

  it('can toggle type to income', async () => {
    const { user } = setup()

    await user.click(screen.getByText('form.type_income'))

    const incomeButton = screen.getByText('form.type_income')
    const expenseButton = screen.getByText('form.type_expense')
    // Income gets active styles, expense loses them
    expect(incomeButton.className).toContain('bg-white')
    expect(expenseButton.className).not.toContain('bg-white')
  })

  // ── Section: Validation ─────────────────────────────────────────────────────

  it('shows validation error when submitting empty name', async () => {
    const { user } = setup()

    // Submit the form without typing a name
    await user.click(screen.getByRole('button', { name: /create_button/i }))

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })
    expect(createCategoryActionMock).not.toHaveBeenCalled()
  })

  // ── Section: Successful submission ──────────────────────────────────────────

  it('calls createCategoryAction with correct data on valid submit', async () => {
    const { user } = setup()
    createCategoryActionMock.mockResolvedValue({
      success: true,
      message: 'Category created',
    })

    await user.type(screen.getByLabelText('form.category_name'), 'Groceries')
    await user.click(screen.getByRole('button', { name: /create_button/i }))

    await waitFor(() => {
      expect(createCategoryActionMock).toHaveBeenCalledWith({
        name: 'Groceries',
        icon: 'more_horizontal',
        color: '94a3b8',
        type: 'expense',
      })
    })
  })

  it('shows success toast and redirects on successful creation', async () => {
    const { user } = setup()
    createCategoryActionMock.mockResolvedValue({
      success: true,
      message: 'Category created',
    })

    await user.type(screen.getByLabelText('form.category_name'), 'Groceries')
    await user.click(screen.getByRole('button', { name: /create_button/i }))

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith('Category created')
      expect(pushMock).toHaveBeenCalledWith('/category')
      expect(refreshMock).toHaveBeenCalled()
    })
  })

  // ── Section: Error handling ─────────────────────────────────────────────────

  it('shows error toast when createCategoryAction fails', async () => {
    const { user } = setup()
    createCategoryActionMock.mockResolvedValue({
      success: false,
      message: 'Name already exists',
    })

    await user.type(screen.getByLabelText('form.category_name'), 'Duplicate')
    await user.click(screen.getByRole('button', { name: /create_button/i }))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Name already exists')
      expect(pushMock).not.toHaveBeenCalled()
    })
  })

  // ── Section: Cancel ─────────────────────────────────────────────────────────

  it('cancel button calls router.back()', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(backMock).toHaveBeenCalled()
  })

  // ── Section: Loading state ──────────────────────────────────────────────────

  it('shows loading state while submitting', async () => {
    const { user } = setup()
    // Mock a slow action that never resolves to keep isPending=true
    createCategoryActionMock.mockImplementation(() => new Promise(() => {}))

    await user.type(screen.getByLabelText('form.category_name'), 'Groceries')
    await user.click(screen.getByRole('button', { name: /create_button/i }))

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /creating/i })
      expect(submitButton).toBeDisabled()
      expect(screen.getByLabelText('form.category_name')).toBeDisabled()
    })
  })
})
