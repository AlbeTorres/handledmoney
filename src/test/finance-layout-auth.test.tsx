import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getSessionMock, headersMock, redirectMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  headersMock: vi.fn(),
  redirectMock: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: getSessionMock } },
}))

vi.mock('next/headers', () => ({ headers: headersMock }))
vi.mock('next/navigation', () => ({ redirect: redirectMock }))
vi.mock('@/app/(financeapp)/components/AppHeader', () => ({ AppHeader: () => null }))
vi.mock('@/app/(financeapp)/components/DashboardFooter', () => ({ DashboardFooter: () => null }))
vi.mock('@/app/(financeapp)/components/Sidemenu', () => ({ AppSidebar: () => null }))
vi.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => children,
}))

import HandledMoneyLayout from '@/app/(financeapp)/layout'

describe('finance layout authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    headersMock.mockResolvedValue(new Headers({ cookie: 'session=abc' }))
  })

  it('redirects when authoritative session validation fails', async () => {
    getSessionMock.mockResolvedValue(null)

    await HandledMoneyLayout({ children: null })

    expect(redirectMock).toHaveBeenCalledWith('/auth/login')
  })

  it('renders only after authoritative session validation succeeds', async () => {
    getSessionMock.mockResolvedValue({ user: { id: 'user-1' } })

    const result = await HandledMoneyLayout({ children: <div>private</div> })

    expect(result).toBeTruthy()
    expect(getSessionMock).toHaveBeenCalledWith({ headers: expect.any(Headers) })
    expect(redirectMock).not.toHaveBeenCalled()
  })
})
