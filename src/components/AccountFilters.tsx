'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const TABS = ['All Accounts', 'USD', 'EUR', 'Crypto']

const SORTS = ['Highest Balance', 'Account Name', 'Recently Added']

export function AccountFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'All Accounts'
  const currentSort = searchParams.get('sort') || 'Highest Balance'

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

  const handleSortChange = (sort: string) => {
    console.log(sort)
    router.push(`?${createQueryString('sort', sort)}`, { scroll: false })
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
          // 1. Movemos el evento al SELECT y usamos onChange
          onChange={e => handleSortChange(e.target.value)}
          // 2. Sincronizamos el valor visual con la URL
          value={currentSort}
          className='bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary rounded'
          aria-label='Sort accounts'
        >
          {SORTS.map(sort => (
            // 3. Agregamos el atributo value a la opción
            <option key={sort} value={sort}>
              {sort}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
