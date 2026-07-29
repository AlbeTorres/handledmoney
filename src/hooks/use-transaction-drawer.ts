'use client'

import { useCallback, useState } from 'react'
import type { Transaction } from '@/interfaces'

export function useTransactionDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [transaction, setTransaction] = useState<Transaction | null>(null)

  const onOpen = useCallback((tx: Transaction) => {
    setTransaction(tx)
    setIsOpen(true)
  }, [])

  const onClose = useCallback(() => {
    setIsOpen(false)
    setTransaction(null)
  }, [])

  return { isOpen, transaction, onOpen, onClose }
}
