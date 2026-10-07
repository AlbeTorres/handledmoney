'use client'

import { Account, Transaction } from '../interfaces'
import { useTransactionDrawer } from '@/hooks/use-transaction-drawer'
import TransactionActionBar from '@/app/(financeapp)/transaction/components/TransactionActionBar'
import { TransactionList } from '@/app/(financeapp)/transaction/components/TransactionList'
import { TransactionQuickEdit } from './TransactionQuickEdit'
import { TransactionSummaryCards } from './TransactionSummaryCards'

type Props = {
  data: Transaction[]
  totalPages: number
  currentPage: number
  categories: { id: string; name: string }[]
  accounts: Account[]
  totalIncome: number
  totalExpenses: number
  netBalance: number
}

export const TransactionPageContent = ({
  data,
  totalPages,
  currentPage,
  categories,
  accounts,
  totalIncome,
  totalExpenses,
  netBalance,
}: Props) => {
  const { isOpen, transaction, onClose } = useTransactionDrawer()

  return (
    <>
      <TransactionSummaryCards
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        netBalance={netBalance}
      />
      <TransactionActionBar categories={categories} transactions={data} />
      <TransactionList
        data={data}
        categories={categories}
        totalPages={totalPages}
        currentPage={currentPage}
      />
      <TransactionQuickEdit
        accounts={accounts}
        categories={categories}
        isOpen={isOpen}
        transaction={transaction}
        onClose={onClose}
      />
    </>
  )
}
