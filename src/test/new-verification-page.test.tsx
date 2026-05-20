import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import NewVerification from '@/app/auth/new-verification/page'

vi.mock('next-intl/server', () => ({
  getTranslations: () => Promise.resolve((key: string) => key),
}))

vi.mock('@/components/ResendEmailForm', () => ({
  ResendEmailForm: ({ email }: { email: string | undefined }) => (
    <div data-testid="resend-email-form" data-email={email || ''} />
  ),
}))

describe('NewVerification Page (Server Component)', () => {
  it('renders error description and login link on Direct Access (no query params)', async () => {
    const searchParams = Promise.resolve({})

    // Resolve the async server component to a renderable JSX node
    const component = await NewVerification({ searchParams })
    render(component)

    expect(screen.getByText('verification_page_description_error')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'verification_page_go_to_login' })).toHaveAttribute(
      'href',
      '/auth/login'
    )
    expect(screen.queryByTestId('resend-email-form')).not.toBeInTheDocument()
  })

  it('renders pending verification message and form on email param', async () => {
    const searchParams = Promise.resolve({ email: 'user@test.com' })

    const component = await NewVerification({ searchParams })
    render(component)

    expect(screen.getByText('verification_page_not_verified')).toBeInTheDocument()

    const form = screen.getByTestId('resend-email-form')
    expect(form).toBeInTheDocument()
    expect(form.getAttribute('data-email')).toBe('user@test.com')

    expect(screen.queryByRole('link', { name: 'verification_page_go_to_login' })).not.toBeInTheDocument()
  })

  it('renders invalid link error and form on error param', async () => {
    const searchParams = Promise.resolve({ error: 'INVALID_TOKEN' })

    const component = await NewVerification({ searchParams })
    render(component)

    expect(screen.getByText('verification_page_invalid_link')).toBeInTheDocument()

    const form = screen.getByTestId('resend-email-form')
    expect(form).toBeInTheDocument()
    expect(form.getAttribute('data-email')).toBe('')

    expect(screen.queryByRole('link', { name: 'verification_page_go_to_login' })).not.toBeInTheDocument()
  })

  it('renders success message and login link on successful redirect (redirect parameter but no error or email)', async () => {
    const searchParams = Promise.resolve({ redirect: 'false' })

    const component = await NewVerification({ searchParams })
    render(component)

    expect(screen.getByText('verification_page_success')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'verification_page_go_to_login' })).toHaveAttribute(
      'href',
      '/auth/login'
    )
    expect(screen.queryByTestId('resend-email-form')).not.toBeInTheDocument()
  })
})
