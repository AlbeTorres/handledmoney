import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('public identity and navigation', () => {
  it('uses the HandledMoney identity and only routes to implemented public auth pages', () => {
    render(
      <>
        <Header />
        <Hero />
        <Footer />
      </>,
    )

    expect(screen.getAllByText('HandledMoney').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Create account' })).toHaveAttribute(
      'href',
      '/auth/new-account',
    )
    expect(screen.getAllByRole('link', { name: 'Sign in' })[0]).toHaveAttribute(
      'href',
      '/auth/login',
    )
    expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms')
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy')
  })
})
