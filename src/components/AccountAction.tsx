'use client'

import { useDebouncedSearchParam } from '@/hooks/use-debounced-search-params'
import { useFilterParam } from '@/hooks/use-filter-params'
import { useSortParam } from '@/hooks/use-sort-params'
import ActionBar from './ActionBar'
import FilterDropdown from './FilterDropdown'
import SortDropdown from './SortDropdown'

const CURRENCY_OPTIONS = [
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'ARS', value: 'ARS' },
  { label: 'GBP', value: 'GBP' },
]

const SORT_OPTIONS = [
  { label: 'Highest Balance', value: 'highest_balance' },
  { label: 'Account Name', value: 'account_name' },
  { label: 'Recently Added', value: 'recently_added' },
]

export default function AccountAction() {
  const [searchTerm, setSearchTerm] = useDebouncedSearchParam('search')
  const [currency, setCurrency] = useFilterParam('currency')
  const [sort, setSort] = useSortParam('sort')
  return (
    <>
      <ActionBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        href='/account/create'
        id='account-search'
        placeholder='Search accounts...'
        ariaLabel='Search accounts'
        buttonText='New Account'
      >
        <FilterDropdown
          label='Currency'
          options={CURRENCY_OPTIONS}
          selected={currency}
          onChange={setCurrency}
        />
        <SortDropdown options={SORT_OPTIONS} selected={sort} onChange={setSort} />
      </ActionBar>
    </>
  )
}
