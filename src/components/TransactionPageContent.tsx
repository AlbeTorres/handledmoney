'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Transaction } from '../interfaces'
import { Tab } from './Tab'
import { TransactionTableContent } from './TransactionTableContent'

type Props = {
  data: Transaction[]
  totalPages: number
  currentPage: number
}

export const TransactionPageContent = ({ data, totalPages, currentPage }: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'expense'
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
    <>
      <Tab activeView={currentTab} onViewChange={handleTabChange} tabs={['income', 'expense']} />
      <TransactionTableContent data={data} totalPages={totalPages} currentPage={currentPage} />
    </>
  )
}
