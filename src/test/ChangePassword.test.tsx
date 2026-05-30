import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChangePassword } from '@/components/ChangePassword'

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { pushMock, resetPasswordMock, toastSuccessMock, toastErrorMock, searchParamsGetMock } =
  vi.hoisted(() => ({
    pushMock: vi.fn(),
    resetPasswordMock: vi.fn(),
    toastSuccessMock: vi.fn(),
    toastErrorMock: vi.fn(),
    searchParamsGetMock: vi.fn<(key: string) => string | null>(),
  }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
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
    resetPassword: resetPasswordMock,
  },
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

const withToken = (token = 'valid-token-abc123') =>
  searchParamsGetMock.mockImplementation(key => (key === 'token' ? token : null))

const withNoToken = () => searchParamsGetMock.mockReturnValue(null)

/** A valid password that satisfies all ChangePasswordSchema requirements */
const VALID_PASSWORD = 'SecurePass1!'

const setup = () => {
  const user = userEvent.setup()
  render(<ChangePassword />)
  return { user }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ChangePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    withToken()
  })

  // ── Renderizado ──────────────────────────────────────────────────────────────

  it('renders password field, submit button and back link', () => {
    setup()

    expect(screen.getByLabelText('password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'reset_password' })).toBeInTheDocument()
    expect(screen.getByText('back_to_login')).toBeInTheDocument()
  })

  it('password field starts hidden (type="password")', () => {
    setup()

    expect(screen.getByLabelText('password')).toHaveAttribute('type', 'password')
  })

  it('submit button is enabled on initial render', () => {
    setup()

    expect(screen.getByRole('button', { name: 'reset_password' })).not.toBeDisabled()
  })

  // ── Toggle de visibilidad ────────────────────────────────────────────────────

  it('toggles password visibility when clicking the eye icon', async () => {
    const { user } = setup()

    const passwordInput = screen.getByLabelText('password')
    const toggleButton = document.querySelector('button[type="button"]') as HTMLButtonElement

    expect(toggleButton).toBeTruthy()
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  // ── Validación del schema ────────────────────────────────────────────────────

  it('does NOT call resetPassword when password is empty', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: 'reset_password' }))

    expect(resetPasswordMock).not.toHaveBeenCalled()
  })

  it('does NOT call resetPassword when password has fewer than 8 characters', async () => {
    const { user } = setup()

    await user.type(screen.getByLabelText('password'), 'Ab1!')
    await user.click(screen.getByRole('button', { name: 'reset_password' }))

    expect(resetPasswordMock).not.toHaveBeenCalled()
  })

  it('does NOT call resetPassword when password lacks an uppercase letter', async () => {
    const { user } = setup()

    await user.type(screen.getByLabelText('password'), 'securepass1!')
    await user.click(screen.getByRole('button', { name: 'reset_password' }))

    expect(resetPasswordMock).not.toHaveBeenCalled()
  })

  it('does NOT call resetPassword when password lacks a number', async () => {
    const { user } = setup()

    await user.type(screen.getByLabelText('password'), 'SecurePass!')
    await user.click(screen.getByRole('button', { name: 'reset_password' }))

    expect(resetPasswordMock).not.toHaveBeenCalled()
  })

  it('does NOT call resetPassword when password lacks a special character', async () => {
    const { user } = setup()

    await user.type(screen.getByLabelText('password'), 'SecurePass1')
    await user.click(screen.getByRole('button', { name: 'reset_password' }))

    expect(resetPasswordMock).not.toHaveBeenCalled()
  })

  it('shows validation error when password does not meet requirements', async () => {
    const { user } = setup()

    await user.type(screen.getByLabelText('password'), 'weak')
    await user.click(screen.getByRole('button', { name: 'reset_password' }))

    await waitFor(() => {
      expect(screen.getByText('error.password_no_secure')).toBeInTheDocument()
    })
  })

  // ── Token ausente ────────────────────────────────────────────────────────────

  it('shows error.missing_token toast and does NOT call API when token is null', async () => {
    withNoToken()
    const { user } = setup()

    await user.type(screen.getByLabelText('password'), VALID_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'reset_password' }))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('error.missing_token')
    })
    expect(resetPasswordMock).not.toHaveBeenCalled()
  })

  it('does NOT redirect when token is null', async () => {
    withNoToken()
    const { user } = setup()

    await user.type(screen.getByLabelText('password'), VALID_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'reset_password' }))

    await waitFor(() => {
      expect(pushMock).not.toHaveBeenCalled()
    })
  })

  // ── Submit exitoso ───────────────────────────────────────────────────────────

  it('calls resetPassword with the correct newPassword and token on valid submit', async () => {
    const { user } = setup()
    resetPasswordMock.mockResolvedValue({ data: { status: true }, error: null })

    await user.type(screen.getByLabelText('password'), VALID_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'reset_password' }))

    await waitFor(() => {
      expect(resetPasswordMock).toHaveBeenCalledOnce()
      expect(resetPasswordMock).toHaveBeenCalledWith({
        newPassword: VALID_PASSWORD,
        token: 'valid-token-abc123',
      })
    })
  })

  it('shows success toast and redirects to "/" on success', async () => {
    const { user } = setup()
    resetPasswordMock.mockResolvedValue({ data: { status: true }, error: null })

    await user.type(screen.getByLabelText('password'), VALID_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'reset_password' }))

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith('success.password_reset')
      expect(pushMock).toHaveBeenCalledWith('/')
    })
  })

  // ── Error: token expirado ────────────────────────────────────────────────────

  it('shows error.invalid_token toast when API returns expired_token message', async () => {
    const { user } = setup()
    resetPasswordMock.mockResolvedValue({
      data: { status: false },
      error: { message: 'expired_token' },
    })

    await user.type(screen.getByLabelText('password'), VALID_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'reset_password' }))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('error.invalid_token')
    })
  })

  it('does NOT redirect when API returns expired_token error', async () => {
    const { user } = setup()
    resetPasswordMock.mockResolvedValue({
      data: { status: false },
      error: { message: 'expired_token' },
    })

    await user.type(screen.getByLabelText('password'), VALID_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'reset_password' }))

    await waitFor(() => {
      expect(pushMock).not.toHaveBeenCalled()
    })
  })

  // ── Error genérico ───────────────────────────────────────────────────────────

  it('shows error.unknown_error toast when API returns a generic error', async () => {
    const { user } = setup()
    resetPasswordMock.mockResolvedValue({
      data: { status: false },
      error: { message: 'Something went wrong' },
    })

    await user.type(screen.getByLabelText('password'), VALID_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'reset_password' }))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('error.unknown_error')
    })
  })

  it('does NOT redirect when API returns a generic error', async () => {
    const { user } = setup()
    resetPasswordMock.mockResolvedValue({
      data: { status: false },
      error: { message: 'Something went wrong' },
    })

    await user.type(screen.getByLabelText('password'), VALID_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'reset_password' }))

    await waitFor(() => {
      expect(pushMock).not.toHaveBeenCalled()
    })
  })

  // ── Estado loading ───────────────────────────────────────────────────────────

  it('disables submit button while request is in flight', async () => {
    const { user } = setup()
    // Promise that never resolves — keeps isPending=true
    resetPasswordMock.mockImplementation(() => new Promise(() => {}))

    await user.type(screen.getByLabelText('password'), VALID_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'reset_password' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'reset_password' })).toBeDisabled()
    })
  })

  it('disables password field while request is in flight', async () => {
    const { user } = setup()
    resetPasswordMock.mockImplementation(() => new Promise(() => {}))

    await user.type(screen.getByLabelText('password'), VALID_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'reset_password' }))

    await waitFor(() => {
      expect(screen.getByLabelText('password')).toBeDisabled()
    })
  })

  it('disables the eye toggle button while request is in flight', async () => {
    const { user } = setup()
    resetPasswordMock.mockImplementation(() => new Promise(() => {}))

    await user.type(screen.getByLabelText('password'), VALID_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'reset_password' }))

    await waitFor(() => {
      const toggleButton = document.querySelector('button[type="button"]') as HTMLButtonElement
      expect(toggleButton).toBeDisabled()
    })
  })
})
