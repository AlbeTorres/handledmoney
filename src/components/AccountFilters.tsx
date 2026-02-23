'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const TABS = ['All Accounts', 'USD', 'EUR', 'Crypto']

export function AccountFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'All Accounts'

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
    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
      <div className='flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-lg'>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-1.5 rounded-md text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary outline-none ${
              currentTab === tab
                ? 'font-bold bg-white dark:bg-slate-700 shadow-sm'
                : 'font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-sm text-slate-500 dark:text-slate-400 font-medium'>Sort by:</span>
        <select
          className='bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary rounded'
          aria-label='Sort accounts'
        >
          <option>Highest Balance</option>
          <option>Account Name</option>
          <option>Recently Added</option>
        </select>
      </div>
    </div>
  )
}
