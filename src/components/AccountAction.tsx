'use client'

import { useTranslations } from 'next-intl'
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

export default function AccountAction() {
  const [searchTerm, setSearchTerm] = useDebouncedSearchParam('search')
  const [currency, setCurrency] = useFilterParam('currency')
  const [sort, setSort] = useSortParam('sort')
  const t = useTranslations('handledmoney.account')

  const SORT_OPTIONS = [
    { label: t('action.sort_highest_balance'), value: 'highest_balance' },
    { label: t('action.sort_account_name'), value: 'account_name' },
    { label: t('action.sort_recently_added'), value: 'recently_added' },
  ]

  return (
    <>
      <ActionBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        href='/account/create'
        id='account-search'
        placeholder={t('action.search_placeholder')}
        ariaLabel={t('action.search_placeholder')}
        buttonText={t('action.new_account')}
      >
        <FilterDropdown
          label={t('action.filter_currency')}
          options={CURRENCY_OPTIONS}
          selected={currency}
          onChange={setCurrency}
        />
        <SortDropdown options={SORT_OPTIONS} selected={sort} onChange={setSort} />
      </ActionBar>
    </>
  )
}
