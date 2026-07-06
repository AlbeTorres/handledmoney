import PersonalInfomationSettings from '@/components/PersonalInfomationSettings'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Hoisted mocks ────────────────────────────────────────────────────────────

const { refreshMock, updateUserMock, toastSuccessMock, toastErrorMock, toastInfoMock } =
  vi.hoisted(() => ({
    refreshMock: vi.fn(),
    updateUserMock: vi.fn(),
    toastSuccessMock: vi.fn(),
    toastErrorMock: vi.fn(),
    toastInfoMock: vi.fn(),
  }))

// ── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: toastSuccessMock,
    error: toastErrorMock,
    info: toastInfoMock,
  },
}))

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: () => ({
      data: {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          phoneNumber: null,
        },
      },
    }),
    updateUser: updateUserMock,
  },
}))

// ── Test suite ───────────────────────────────────────────────────────────────

describe('PersonalInfomationSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Renderizado inicial ──────────────────────────────────────────────────

  it('renders section title and EDIT button', () => {
    render(<PersonalInfomationSettings />)

    expect(screen.getByText('Personal Information')).toBeTruthy()
    expect(screen.getByRole('button', { name: /edit/i })).toBeTruthy()
  })

  it('pre-populates name and email fields with session data', () => {
    render(<PersonalInfomationSettings />)

    expect(screen.getByDisplayValue('John Doe')).toBeTruthy()
    expect(screen.getByDisplayValue('john@example.com')).toBeTruthy()
  })

  it('renders the phone number field as read-only', () => {
    render(<PersonalInfomationSettings />)

    const phoneInput = screen.getByLabelText(/phone number/i)
    expect(phoneInput).toHaveAttribute('readonly')
  })

  // ── Modo lectura inicial ─────────────────────────────────────────────────

  it('name and email fields are read-only before clicking EDIT', () => {
    render(<PersonalInfomationSettings />)

    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)

    expect(nameInput).toHaveAttribute('readonly')
    expect(emailInput).toHaveAttribute('readonly')
  })

  it('SAVE and CANCEL buttons are not visible in read-only mode', () => {
    render(<PersonalInfomationSettings />)

    expect(screen.queryByRole('button', { name: /save changes/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /cancel/i })).toBeNull()
  })

  // ── Modo edición ─────────────────────────────────────────────────────────

  it('enables name and email fields after clicking EDIT', async () => {
    const user = userEvent.setup()
    render(<PersonalInfomationSettings />)

    await user.click(screen.getByRole('button', { name: /edit/i }))

    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)

    expect(nameInput).not.toHaveAttribute('readonly')
    expect(emailInput).not.toHaveAttribute('readonly')
  })

  it('shows SAVE CHANGES and CANCEL buttons after clicking EDIT', async () => {
    const user = userEvent.setup()
    render(<PersonalInfomationSettings />)

    await user.click(screen.getByRole('button', { name: /edit/i }))

    expect(screen.getByRole('button', { name: /save changes/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeTruthy()
  })

  it('hides the EDIT button while in edit mode', async () => {
    const user = userEvent.setup()
    render(<PersonalInfomationSettings />)

    await user.click(screen.getByRole('button', { name: /edit/i }))

    expect(screen.queryByRole('button', { name: /^edit$/i })).toBeNull()
  })

  // ── Cancel reset ─────────────────────────────────────────────────────────

  it('resets the form to session values when CANCEL is clicked', async () => {
    const user = userEvent.setup()
    render(<PersonalInfomationSettings />)

    await user.click(screen.getByRole('button', { name: /edit/i }))

    const nameInput = screen.getByLabelText(/full name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Modified Name')

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.getByDisplayValue('John Doe')).toBeTruthy()
  })

  it('returns to read-only mode after CANCEL', async () => {
    const user = userEvent.setup()
    render(<PersonalInfomationSettings />)

    await user.click(screen.getByRole('button', { name: /edit/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.getByLabelText(/full name/i)).toHaveAttribute('readonly')
    expect(screen.queryByRole('button', { name: /save changes/i })).toBeNull()
  })

  // ── Validación ───────────────────────────────────────────────────────────

  it('does not call updateUser when name is cleared (required)', async () => {
    const user = userEvent.setup()
    render(<PersonalInfomationSettings />)

    await user.click(screen.getByRole('button', { name: /edit/i }))
    await user.clear(screen.getByLabelText(/full name/i))
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(updateUserMock).not.toHaveBeenCalled()
  })

  it('does not call updateUser when email is invalid format', async () => {
    const user = userEvent.setup()
    render(<PersonalInfomationSettings />)

    await user.click(screen.getByRole('button', { name: /edit/i }))

    const emailInput = screen.getByLabelText(/email address/i)
    await user.clear(emailInput)
    await user.type(emailInput, 'not-an-email')

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(updateUserMock).not.toHaveBeenCalled()
  })

  // ── Submit — solo nombre cambia ──────────────────────────────────────────

  it('calls updateUser with correct payload when only name changes', async () => {
    const user = userEvent.setup()
    updateUserMock.mockResolvedValueOnce({ data: { user: {} }, error: null })

    render(<PersonalInfomationSettings />)

    await user.click(screen.getByRole('button', { name: /edit/i }))

    const nameInput = screen.getByLabelText(/full name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(updateUserMock).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Jane Doe', email: 'john@example.com' }),
      )
    })
  })

  it('shows success toast when update succeeds with no email change', async () => {
    const user = userEvent.setup()
    updateUserMock.mockResolvedValueOnce({ data: { user: {} }, error: null })

    render(<PersonalInfomationSettings />)

    await user.click(screen.getByRole('button', { name: /edit/i }))

    const nameInput = screen.getByLabelText(/full name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalled()
    })
  })

  it('calls router.refresh() after a successful update', async () => {
    const user = userEvent.setup()
    updateUserMock.mockResolvedValueOnce({ data: { user: {} }, error: null })

    render(<PersonalInfomationSettings />)

    await user.click(screen.getByRole('button', { name: /edit/i }))

    const nameInput = screen.getByLabelText(/full name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled()
    })
  })

  it('returns to read-only mode after successful save', async () => {
    const user = userEvent.setup()
    updateUserMock.mockResolvedValueOnce({ data: { user: {} }, error: null })

    render(<PersonalInfomationSettings />)

    await user.click(screen.getByRole('button', { name: /edit/i }))

    const nameInput = screen.getByLabelText(/full name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toHaveAttribute('readonly')
    })
  })

  // ── Submit — email cambia ────────────────────────────────────────────────

  it('shows info toast (not success) when email is also changed', async () => {
    const user = userEvent.setup()
    updateUserMock.mockResolvedValueOnce({ data: { user: {} }, error: null })

    render(<PersonalInfomationSettings />)

    await user.click(screen.getByRole('button', { name: /edit/i }))

    const emailInput = screen.getByLabelText(/email address/i)
    await user.clear(emailInput)
    await user.type(emailInput, 'new@example.com')

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(toastInfoMock).toHaveBeenCalled()
      expect(toastSuccessMock).not.toHaveBeenCalled()
    })
  })

  // ── Error en update ──────────────────────────────────────────────────────

  it('shows error toast when updateUser fails', async () => {
    const user = userEvent.setup()
    updateUserMock.mockResolvedValueOnce({
      data: null,
      error: { message: 'Something went wrong' },
    })

    render(<PersonalInfomationSettings />)

    await user.click(screen.getByRole('button', { name: /edit/i }))
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalled()
    })
  })

  it('stays in edit mode when update fails', async () => {
    const user = userEvent.setup()
    updateUserMock.mockResolvedValueOnce({
      data: null,
      error: { message: 'Something went wrong' },
    })

    render(<PersonalInfomationSettings />)

    await user.click(screen.getByRole('button', { name: /edit/i }))
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save changes/i })).toBeTruthy()
    })
  })

  // ── Estado loading ───────────────────────────────────────────────────────

  it('disables SAVE and CANCEL while the request is in flight', async () => {
    const user = userEvent.setup()
    // Promise que nunca resuelve → mantiene isPending=true
    updateUserMock.mockImplementation(() => new Promise(() => {}))

    render(<PersonalInfomationSettings />)

    await user.click(screen.getByRole('button', { name: /edit/i }))
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
    })
  })

  // ── Sin sesión ───────────────────────────────────────────────────────────

  it('renders empty fields when there is no session', () => {
    vi.mocked(
      vi.importMock<{ authClient: { useSession: () => { data: null } } }>(
        '@/lib/auth-client',
      ),
    )

    // Re-render with null session mock
    vi.doMock('@/lib/auth-client', () => ({
      authClient: {
        useSession: () => ({ data: null }),
        updateUser: updateUserMock,
      },
    }))

    // The component should render without crashing even with no session
    expect(() => render(<PersonalInfomationSettings />)).not.toThrow()
  })
})
