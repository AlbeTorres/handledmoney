import { LoginForm } from '@/components/LoginForm'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { pushMock, signInEmailMock, toastErrorMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  signInEmailMock: vi.fn(),
  toastErrorMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('react-hot-toast', () => ({
  default: {
    error: toastErrorMock,
  },
}))

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      email: signInEmailMock,
    },
  },
}))

type SignInCallbacks = {
  onSuccess: () => void
  onError: (ctx: { error: { status: number } }) => Promise<void>
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Renderizado ─────────────────────────────────────────────────────────────

  it('renders email field, password field, remember me checkbox and submit button', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText('email')).toBeTruthy()
    expect(screen.getByLabelText('password')).toBeTruthy()
    expect(screen.getByRole('checkbox')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'signin' })).toBeTruthy()
  })

  it('submit button is enabled on initial render', () => {
    render(<LoginForm />)

    expect(screen.getByRole('button', { name: 'signin' })).not.toBeDisabled()
  })

  it('password field starts hidden (type="password")', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText('password')).toHaveAttribute('type', 'password')
  })

  // ── Toggle de contraseña ─────────────────────────────────────────────────────

  it('toggles password visibility when clicking the eye icon', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const passwordInput = screen.getByLabelText('password')
    const toggleButton = document.querySelector('button[type="button"]') as HTMLButtonElement

    expect(toggleButton).toBeTruthy()
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  // ── Validación ───────────────────────────────────────────────────────────────

  it('does not call signIn when submitting with empty fields', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole('button', { name: 'signin' }))

    expect(signInEmailMock).not.toHaveBeenCalled()
  })

  it('does not call signIn when email format is invalid', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText('email'), 'not-an-email')
    await user.type(screen.getByLabelText('password'), 'mypassword')
    await user.click(screen.getByRole('button', { name: 'signin' }))

    expect(signInEmailMock).not.toHaveBeenCalled()
  })

  it('does not call signIn when password is empty', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText('email'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: 'signin' }))

    expect(signInEmailMock).not.toHaveBeenCalled()
  })

  // ── Submit exitoso ───────────────────────────────────────────────────────────

  it('calls signIn.email with correct payload on valid submit', async () => {
    const user = userEvent.setup()
    signInEmailMock.mockImplementation(async (_data: unknown, callbacks: SignInCallbacks) => {
      callbacks.onSuccess()
    })

    render(<LoginForm />)

    await user.type(screen.getByLabelText('email'), 'user@example.com')
    await user.type(screen.getByLabelText('password'), 'mypassword')
    await user.click(screen.getByRole('button', { name: 'signin' }))

    await waitFor(() => {
      expect(signInEmailMock).toHaveBeenCalledWith(
        {
          email: 'user@example.com',
          password: 'mypassword',
          callbackURL: '/dashboard',
          rememberMe: false,
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      )
    })
  })

  it('sends rememberMe: true when the checkbox is checked before submitting', async () => {
    const user = userEvent.setup()
    signInEmailMock.mockImplementation(async (_data: unknown, callbacks: SignInCallbacks) => {
      callbacks.onSuccess()
    })

    render(<LoginForm />)

    await user.type(screen.getByLabelText('email'), 'user@example.com')
    await user.type(screen.getByLabelText('password'), 'mypassword')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'signin' }))

    await waitFor(() => {
      expect(signInEmailMock).toHaveBeenCalledWith(
        expect.objectContaining({ rememberMe: true }),
        expect.any(Object),
      )
    })
  })

  // ── Estado loading ───────────────────────────────────────────────────────────

  it('disables email, password and submit button while the request is in flight', async () => {
    const user = userEvent.setup()
    // Promise que nunca resuelve → mantiene isPending=true
    signInEmailMock.mockImplementation(() => new Promise(() => {}))

    render(<LoginForm />)

    await user.type(screen.getByLabelText('email'), 'user@example.com')
    await user.type(screen.getByLabelText('password'), 'mypassword')
    await user.click(screen.getByRole('button', { name: 'signin' }))

    await waitFor(() => {
      expect(screen.getByLabelText('email')).toBeDisabled()
      expect(screen.getByLabelText('password')).toBeDisabled()
      expect(screen.getByRole('button', { name: 'signin' })).toBeDisabled()
    })
  })

  // ── Error 403 (email sin verificar) ──────────────────────────────────────────

  it('redirects to /auth/new-verification with the user email when status is 403', async () => {
    const user = userEvent.setup()
    signInEmailMock.mockImplementation(async (_data: unknown, callbacks: SignInCallbacks) => {
      await callbacks.onError({ error: { status: 403 } })
    })

    render(<LoginForm />)

    await user.type(screen.getByLabelText('email'), 'user@example.com')
    await user.type(screen.getByLabelText('password'), 'mypassword')
    await user.click(screen.getByRole('button', { name: 'signin' }))

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        '/auth/new-verification?email=user@example.com',
      )
    })
  })

  it('does not show a toast when error status is 403', async () => {
    const user = userEvent.setup()
    signInEmailMock.mockImplementation(async (_data: unknown, callbacks: SignInCallbacks) => {
      await callbacks.onError({ error: { status: 403 } })
    })

    render(<LoginForm />)

    await user.type(screen.getByLabelText('email'), 'user@example.com')
    await user.type(screen.getByLabelText('password'), 'mypassword')
    await user.click(screen.getByRole('button', { name: 'signin' }))

    await waitFor(() => {
      expect(toastErrorMock).not.toHaveBeenCalled()
    })
  })

  // ── Error genérico ───────────────────────────────────────────────────────────

  it('shows an error toast when sign in fails with a non-403 error', async () => {
    const user = userEvent.setup()
    signInEmailMock.mockImplementation(async (_data: unknown, callbacks: SignInCallbacks) => {
      await callbacks.onError({ error: { status: 500 } })
    })

    render(<LoginForm />)

    await user.type(screen.getByLabelText('email'), 'user@example.com')
    await user.type(screen.getByLabelText('password'), 'mypassword')
    await user.click(screen.getByRole('button', { name: 'signin' }))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('error.invalid_credentials')
    })
  })

  it('does not redirect when sign in fails with a non-403 error', async () => {
    const user = userEvent.setup()
    signInEmailMock.mockImplementation(async (_data: unknown, callbacks: SignInCallbacks) => {
      await callbacks.onError({ error: { status: 500 } })
    })

    render(<LoginForm />)

    await user.type(screen.getByLabelText('email'), 'user@example.com')
    await user.type(screen.getByLabelText('password'), 'mypassword')
    await user.click(screen.getByRole('button', { name: 'signin' }))

    await waitFor(() => {
      expect(pushMock).not.toHaveBeenCalled()
    })
  })
})
