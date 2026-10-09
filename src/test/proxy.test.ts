import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getSessionCookieMock } = vi.hoisted(() => ({
  getSessionCookieMock: vi.fn(),
}))

vi.mock('better-auth/cookies', () => ({
  getSessionCookie: getSessionCookieMock,
}))

import { config, proxy } from '@/proxy'

const request = (url = 'http://localhost/dashboard') => new Request(url)

describe('proxy config.matcher', () => {
  it('covers exactly the financeapp segments, with trailing-path support', () => {
    expect(config.matcher).toEqual([
      '/dashboard/:path*',
      '/transaction/:path*',
      '/account/:path*',
      '/category/:path*',
      '/budget/:path*',
      '/settings/:path*',
    ])
  })

  it('does not protect auth or landing routes', () => {
    expect(config.matcher.some(entry => entry.startsWith('/auth'))).toBe(false)
    expect(config.matcher.some(entry => entry.startsWith('/terms'))).toBe(false)
  })
})

describe('proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to the login page when there is no session cookie', async () => {
    getSessionCookieMock.mockReturnValue(null)

    const response = await proxy(request() as never)

    expect(response.status).toBeGreaterThanOrEqual(300)
    expect(response.status).toBeLessThan(400)
    expect(new URL(response.headers.get('location') ?? '').pathname).toBe('/auth/login')
  })

  it('lets the request through when a session cookie exists', async () => {
    getSessionCookieMock.mockReturnValue('signed-session-cookie')

    const response = await proxy(request() as never)

    expect(response.headers.get('x-middleware-next')).toBe('1')
  })

  it('checks the incoming request cookie without opening a database session', async () => {
    getSessionCookieMock.mockReturnValue('signed-session-cookie')
    const incoming = new Request('http://localhost/transaction', {
      headers: { cookie: 'session=abc' },
    })

    await proxy(incoming as never)

    expect(getSessionCookieMock).toHaveBeenCalledWith(incoming)
  })
})
