import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RegisterForm } from './RegisterForm'

const { replaceMock, signUpEmailMock, toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  signUpEmailMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
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
    signUp: {
      email: signUpEmailMock,
    },
  },
}))

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders fields and submit starts disabled', () => {
    render(<RegisterForm />)

    expect(screen.getByLabelText('name')).toBeTruthy()
    expect(screen.getByLabelText('email')).toBeTruthy()
    expect(screen.getByLabelText('password')).toBeTruthy()
    expect(screen.getByRole('checkbox')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'signup' })).toHaveProperty('disabled', true)
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const passwordInput = screen.getByLabelText('password')
    const toggleButton = document.querySelector('button[type="button"]')

    expect(passwordInput.getAttribute('type')).toBe('password')
    expect(toggleButton).toBeTruthy()

    await user.click(toggleButton as HTMLButtonElement)
    expect(passwordInput.getAttribute('type')).toBe('text')

    await user.click(toggleButton as HTMLButtonElement)
    expect(passwordInput.getAttribute('type')).toBe('password')
  })

  it('shows validation errors when submitting invalid form with terms accepted', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'signup' }))

    expect(await screen.findByText('error.name_required')).toBeTruthy()
    expect(await screen.findByText('error.email_required')).toBeTruthy()
    expect(await screen.findByText('error.password_too_short')).toBeTruthy()
    expect(signUpEmailMock).not.toHaveBeenCalled()
  })

  it('calls signup and navigates on success', async () => {
    const user = userEvent.setup()
    signUpEmailMock.mockResolvedValue({ error: null })

    render(<RegisterForm />)

    await user.type(screen.getByLabelText('name'), 'Jane Doe')
    await user.type(screen.getByLabelText('email'), 'jane@example.com')
    await user.type(screen.getByLabelText('password'), 'password123')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'signup' }))

    await waitFor(() => {
      expect(signUpEmailMock).toHaveBeenCalledWith({
        role: 'user',
        email: 'jane@example.com',
        password: 'password123',
        name: 'Jane Doe',
        termsAcceptedAt: expect.any(Date),
        callbackURL: '/auth/new-verification?redirect=false',
      })
      expect(toastSuccessMock).toHaveBeenCalledWith('success.email_sent', { duration: 5000 })
      expect(replaceMock).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('shows error toast and does not navigate on signup error', async () => {
    const user = userEvent.setup()
    signUpEmailMock.mockResolvedValue({ error: { message: 'failure' } })

    render(<RegisterForm />)

    await user.type(screen.getByLabelText('name'), 'Jane Doe')
    await user.type(screen.getByLabelText('email'), 'jane@example.com')
    await user.type(screen.getByLabelText('password'), 'password123')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'signup' }))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('error.unknown_error', { duration: 5000 })
      expect(replaceMock).not.toHaveBeenCalled()
    })
  })
})
