'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Transaction } from '../interfaces'
import { Tab } from './Tab'
import { TransactionTableContent } from './TransactionTableContent'

type Props = {
  data: Transaction[]
}

export const TransactionPageContent = ({ data }: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'Expense'
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      return params.toString()
    },
    [searchParams],
  )

  const handleTabChange = (tab: string) => {
    router.push(`?${createQueryString('tab', tab)}`, { scroll: false })
  }

  return (
    <div>
      <Tab activeView={currentTab} onViewChange={handleTabChange} tabs={['Income', 'Expense']} />
      <TransactionTableContent data={data} />
    </div>
  )
}
