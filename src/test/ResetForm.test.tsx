import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ResetForm } from '@/components/ResetForm'

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { requestPasswordResetMock, toastSuccessMock, toastErrorMock, searchParamsGetMock } =
  vi.hoisted(() => ({
    requestPasswordResetMock: vi.fn(),
    toastSuccessMock: vi.fn(),
    toastErrorMock: vi.fn(),
    searchParamsGetMock: vi.fn<(key: string) => string | null>(),
  }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: searchParamsGetMock }),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}))

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    requestPasswordReset: requestPasswordResetMock,
  },
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

const setup = () => {
  searchParamsGetMock.mockReturnValue(null)
  const user = userEvent.setup()
  render(<ResetForm />)
  return { user }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ResetForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  // ── Renderizado ──────────────────────────────────────────────────────────────

  it('renders email field, submit button and back link', () => {
    setup()

    expect(screen.getByPlaceholderText('email_placeholder')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'send_reset_email' })).toBeInTheDocument()
    expect(screen.getByText('back_to_login')).toBeInTheDocument()
  })

  it('renders the email field label (showFieldLabel=true)', () => {
    setup()

    expect(screen.getByText('email')).toBeInTheDocument()
  })

  // ── Validación ───────────────────────────────────────────────────────────────

  it('does NOT call requestPasswordReset when email is empty', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: 'send_reset_email' }))

    expect(requestPasswordResetMock).not.toHaveBeenCalled()
  })

  it('does NOT call requestPasswordReset when email format is invalid', async () => {
    const { user } = setup()

    await user.type(screen.getByPlaceholderText('email_placeholder'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'send_reset_email' }))

    expect(requestPasswordResetMock).not.toHaveBeenCalled()
  })

  // ── Llamada a la API ─────────────────────────────────────────────────────────

  it('calls requestPasswordReset with the correct email on valid submit', async () => {
    const { user } = setup()
    requestPasswordResetMock.mockResolvedValue({ error: null })

    await user.type(screen.getByPlaceholderText('email_placeholder'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: 'send_reset_email' }))

    await waitFor(() => {
      expect(requestPasswordResetMock).toHaveBeenCalledOnce()
      expect(requestPasswordResetMock).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'user@example.com' }),
      )
    })
  })

  it('calls requestPasswordReset with redirectTo pointing to /auth/reset-password', async () => {
    const { user } = setup()
    requestPasswordResetMock.mockResolvedValue({ error: null })

    await user.type(screen.getByPlaceholderText('email_placeholder'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: 'send_reset_email' }))

    await waitFor(() => {
      expect(requestPasswordResetMock).toHaveBeenCalledWith(
        expect.objectContaining({
          redirectTo: expect.stringContaining('/auth/reset-password'),
        }),
      )
    })
  })

  // ── Respuesta exitosa ────────────────────────────────────────────────────────

  it('shows success toast when API call succeeds', async () => {
    const { user } = setup()
    requestPasswordResetMock.mockResolvedValue({ error: null })

    await user.type(screen.getByPlaceholderText('email_placeholder'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: 'send_reset_email' }))

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith('password_reset_email_sent')
    })
  })

  it('triggers cooldown after successful request (button becomes disabled)', async () => {
    const { user } = setup()
    requestPasswordResetMock.mockResolvedValue({ error: null })

    const button = screen.getByRole('button', { name: 'send_reset_email' })
    await user.type(screen.getByPlaceholderText('email_placeholder'), 'user@example.com')
    await user.click(button)

    await waitFor(() => {
      expect(button).toBeDisabled()
    })
  })

  // ── Respuesta con error ──────────────────────────────────────────────────────

  it('shows error toast with the API error message when call fails', async () => {
    const { user } = setup()
    requestPasswordResetMock.mockResolvedValue({ error: { message: 'User not found' } })

    await user.type(screen.getByPlaceholderText('email_placeholder'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: 'send_reset_email' }))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('User not found')
    })
  })

  it('shows generic error toast when API returns error without message', async () => {
    const { user } = setup()
    requestPasswordResetMock.mockResolvedValue({ error: {} })

    await user.type(screen.getByPlaceholderText('email_placeholder'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: 'send_reset_email' }))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('error.unknown_error')
    })
  })

  it('does NOT trigger cooldown when API returns an error', async () => {
    const { user } = setup()
    requestPasswordResetMock.mockResolvedValue({ error: { message: 'Some error' } })

    const button = screen.getByRole('button', { name: 'send_reset_email' })
    await user.type(screen.getByPlaceholderText('email_placeholder'), 'user@example.com')
    await user.click(button)

    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })
  })

  // ── Estado loading ───────────────────────────────────────────────────────────

  it('disables submit button while request is in flight', async () => {
    const { user } = setup()
    // Promise that never resolves — keeps isPending=true
    requestPasswordResetMock.mockImplementation(() => new Promise(() => {}))

    await user.type(screen.getByPlaceholderText('email_placeholder'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: 'send_reset_email' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'sending' })).toBeDisabled()
    })
  })
})
