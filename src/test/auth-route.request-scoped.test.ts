import { beforeEach, describe, expect, it, vi } from 'vitest'

const { withDbMock, drizzleAdapterMock, betterAuthMock } = vi.hoisted(() => ({
  withDbMock: vi.fn(),
  drizzleAdapterMock: vi.fn((db: unknown) => ({ adapterOf: db })),
  betterAuthMock: vi.fn((options: { database: unknown }) => ({
    handler: async () =>
      new Response(JSON.stringify({ database: options.database }), {
        headers: { 'content-type': 'application/json' },
      }),
  })),
}))

vi.mock('@/db', () => ({ withDb: withDbMock }))
vi.mock('better-auth', () => ({ betterAuth: betterAuthMock }))
vi.mock('better-auth/adapters/drizzle', () => ({ drizzleAdapter: drizzleAdapterMock }))

import { POST } from '@/app/api/auth/[...all]/route'

describe('auth route (request-scoped)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    let next = 0
    withDbMock.mockImplementation(async (fn: (db: unknown) => Promise<unknown>) =>
      fn({ requestId: ++next }),
    )
  })

  it('builds Better Auth inside withDb for every incoming request', async () => {
    const response = await POST(new Request('http://localhost/api/auth/get-session'))
    expect(response.status).toBe(200)
    expect(withDbMock).toHaveBeenCalledTimes(1)
    expect(betterAuthMock).toHaveBeenCalledTimes(1)
  })

  it('uses a different database handle per request (no shared auth singleton)', async () => {
    const first = await POST(new Request('http://localhost/api/auth/get-session'))
    const second = await POST(new Request('http://localhost/api/auth/get-session'))

    const firstDb = (await first.json()).database.adapterOf
    const secondDb = (await second.json()).database.adapterOf

    expect(firstDb).toEqual({ requestId: 1 })
    expect(secondDb).toEqual({ requestId: 2 })
    expect(firstDb).not.toBe(secondDb)
    expect(withDbMock).toHaveBeenCalledTimes(2)
  })

  it('returns the response produced by the per-request handler', async () => {
    const response = await POST(new Request('http://localhost/api/auth/get-session'))
    expect(response.headers.get('content-type')).toBe('application/json')
  })
})
