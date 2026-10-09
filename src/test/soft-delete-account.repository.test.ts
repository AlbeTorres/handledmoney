import { beforeEach, describe, expect, it, vi } from 'vitest'

const { dbMock, txMock, transferWithinMock } = vi.hoisted(() => {
  const transactionSelectMock = vi.fn(() => ({
    from: () => ({
      where: async () => [{ id: 'tx-1' }],
    }),
  }))
  return {
    dbMock: {
      transaction: vi.fn(),
    },
    txMock: {
      select: transactionSelectMock,
      update: vi.fn(() => ({
        set: () => ({
          where: () => ({ returning: async () => [{ id: 'account-1' }] }),
        }),
      })),
    },
    transferWithinMock: vi.fn(async (..._args: unknown[]) => {}),
  }
})

vi.mock('@/db', () => ({
  withDb: <T,>(fn: (db: unknown) => T) => fn(dbMock),
}))

vi.mock('@/repository/transaction', () => ({
  transferTransactionsWithin: transferWithinMock,
}))

import { softDeleteBankAccount } from '@/repository/account'

describe('softDeleteBankAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbMock.transaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback(txMock),
    )
  })

  it('runs the transfer and the soft delete inside ONE transaction', async () => {
    await softDeleteBankAccount('account-1', 'user-1', 'account-2')

    expect(dbMock.transaction).toHaveBeenCalledTimes(1)
    expect(transferWithinMock).toHaveBeenCalledTimes(1)
    const [tx, fromId, toId, txIds] = transferWithinMock.mock.calls[0]
    expect(tx).toBe(txMock)
    expect(fromId).toBe('account-1')
    expect(toId).toBe('account-2')
    expect(txIds).toEqual(['tx-1'])
  })

  it('receives the very same transaction handle the delete uses', async () => {
    let deleteHandle: unknown = null
    txMock.update.mockImplementationOnce(() => ({
      set: () => ({
        where: () => ({
          returning: async () => {
            deleteHandle = txMock
            return [{ id: 'account-1' }]
          },
        }),
      }),
    }))

    await softDeleteBankAccount('account-1', 'user-1', 'account-2')

    expect(deleteHandle).toBe(txMock)
    expect(transferWithinMock.mock.calls[0][0]).toBe(deleteHandle)
  })

  it('skips the transfer when no destination account is given', async () => {
    await softDeleteBankAccount('account-1', 'user-1')

    expect(dbMock.transaction).toHaveBeenCalledTimes(1)
    expect(transferWithinMock).not.toHaveBeenCalled()
  })

  it('throws when the transaction fails', async () => {
    dbMock.transaction.mockRejectedValueOnce(new Error('boom'))

    await expect(softDeleteBankAccount('account-1', 'user-1')).rejects.toThrow(
      'Error deleting account',
    )
  })
})
