'use client'
import ExpensesTable from '@/components/ExpensesTable'

import IncomeTable from '@/components/IncomeTable'
import SummaryCards from '@/components/SummaryCards'
import TransactionHeader from '@/components/TransactionHeader'
import { EXPENSES, INCOME } from '@/lib/data'
import { fmtDate } from '@/lib/utils'
import { useState } from 'react'

export default function TransactionPage() {
  const [activeView, setActiveView] = useState('expenses')
  const [search, setSearch] = useState('')

  const filteredExpenses = EXPENSES.filter(
    tx =>
      tx.payee.toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase()),
  )

  const filteredIncome = INCOME.filter(row =>
    fmtDate(row.date).toLowerCase().includes(search.toLowerCase()),
  )

  function handleViewChange(view: string) {
    setActiveView(view)
    setSearch('')
  }

  return (
    <div className='bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen'>
      <div className='flex h-screen overflow-hidden'>
        <main className='flex-1 flex flex-col overflow-y-auto'>
          <TransactionHeader
            activeView={activeView}
            onViewChange={handleViewChange}
            search={search}
            onSearch={setSearch}
          />
          <div className='p-8 flex flex-col gap-8 max-w-[1400px] mx-auto w-full'>
            <SummaryCards activeView={activeView} />
            {activeView === 'expenses' ? (
              <ExpensesTable data={filteredExpenses} />
            ) : (
              <IncomeTable data={filteredIncome} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
