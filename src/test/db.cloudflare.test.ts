import { beforeEach, describe, expect, it, vi } from 'vitest'

const { clientMock, drizzleMock, ClientMock } = vi.hoisted(() => {
  const clientMock = {
    connect: vi.fn(),
    end: vi.fn(),
  }
  return {
    clientMock,
    drizzleMock: vi.fn(() => ({ kind: 'drizzle-db' })),
    // function (not arrow) so `new Client(...)` can construct it
    ClientMock: vi.fn(function Client(this: unknown) {
      return clientMock
    }),
  }
})

vi.mock('pg', () => ({ Client: ClientMock }))
vi.mock('drizzle-orm/node-postgres', () => ({ drizzle: drizzleMock }))

import { withHyperdriveDb } from '@/db/cloudflare'

describe('cloudflare withDb', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clientMock.connect.mockResolvedValue(undefined)
    clientMock.end.mockResolvedValue(undefined)
  })

  it('connects a client, runs the callback on a fresh drizzle handle and releases it', async () => {
    const result = await withHyperdriveDb('postgres://hyperdrive', async db => {
      expect(db).toEqual({ kind: 'drizzle-db' })
      return 'done'
    })

    expect(result).toBe('done')
    expect(ClientMock).toHaveBeenCalledWith({ connectionString: 'postgres://hyperdrive' })
    expect(clientMock.connect).toHaveBeenCalledTimes(1)
    expect(drizzleMock).toHaveBeenCalledTimes(1)
    expect(clientMock.end).toHaveBeenCalledTimes(1)
    // connect strictly before the work, end strictly after
    expect(clientMock.connect.mock.invocationCallOrder[0]).toBeLessThan(
      clientMock.end.mock.invocationCallOrder[0],
    )
  })

  it('creates a new client per call so no handle is reused across operations', async () => {
    await withHyperdriveDb('postgres://hyperdrive', async () => 'a')
    await withHyperdriveDb('postgres://hyperdrive', async () => 'b')

    expect(ClientMock).toHaveBeenCalledTimes(2)
    expect(clientMock.end).toHaveBeenCalledTimes(2)
  })

  it('releases the client even when the callback throws', async () => {
    await expect(
      withHyperdriveDb('postgres://hyperdrive', async () => {
        throw new Error('query failed')
      }),
    ).rejects.toThrow('query failed')

    expect(clientMock.end).toHaveBeenCalledTimes(1)
  })

  it('fails fast with a provisioning message when the Hyperdrive binding is missing', async () => {
    await expect(withHyperdriveDb(undefined, async () => 'never')).rejects.toThrow(
      'HYPERDRIVE binding is not configured',
    )
    expect(ClientMock).not.toHaveBeenCalled()
  })
})
