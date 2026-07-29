'use client'

import { useDebouncedSearchParam } from '@/hooks/use-debounced-search-params'
import { useFilterParam } from '@/hooks/use-filter-params'
import { useSortParam } from '@/hooks/use-sort-params'
import { Transaction } from '@/interfaces'
import { exportTransactionsToCSV } from '@/lib/export-csv'
import { Download, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import ActionBar from './ActionBar'
import FilterDropdown from './FilterDropdown'
import SortDropdown from './SortDropdown'
import { Button } from './ui/button'

type Props = {
  categories: { id: string; name: string }[]
  transactions: Transaction[]
}

export default function TransactionActionBar({ categories, transactions }: Props) {
  const [searchTerm, setSearchTerm] = useDebouncedSearchParam('search')
  const [type, setType] = useFilterParam('type')
  const [category, setCategory] = useFilterParam('category')
  const [sort, setSort] = useSortParam('sort')
  const t = useTranslations('handledmoney.transaction')

  const TYPE_OPTIONS = [
    { label: t('filter.expenses'), value: 'expenses' },
    { label: t('filter.income'), value: 'income' },
  ]

  const CATEGORY_OPTIONS = categories.map(cat => ({
    label: cat.name,
    value: cat.id,
  }))

  const SORT_OPTIONS = [
    { label: t('sort.date'), value: 'date' },
    { label: t('sort.amount_high'), value: 'amount_high' },
    { label: t('sort.amount_low'), value: 'amount_low' },
    { label: t('sort.recently_added'), value: 'recently_added' },
  ]

  return (
    <>
      <div className='flex items-center justify-end mt-6 mb-14 gap-2'>
        <Button
          data-testid='export-csv-button'
          variant='outline'
          size='sm'
          onClick={() => exportTransactionsToCSV(transactions)}
        >
          <Download className='size-4' />
          <span>{t('action.export_csv')}</span>
        </Button>
        <Link
          href='/transaction/bulk'
          data-testid='bulk-add-button'
          className='inline-flex items-center shadow-lg gap-1.5 border border-input bg-background hover:bg-accent hover:text-accent-foreground px-3 py-1.5 rounded-md text-sm font-medium transition-colors'
        >
          <Upload className='size-4' />
          <span>{t('action.bulk_add')}</span>
        </Link>
      </div>
      <ActionBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        href='/transaction/create'
        id='transaction-search'
        placeholder={t('action.search_placeholder')}
        ariaLabel={t('action.search_placeholder')}
        buttonText={t('action.new_transaction')}
      >
        <FilterDropdown
          label={t('action.filter_type')}
          options={TYPE_OPTIONS}
          selected={type}
          onChange={setType}
        />
        <FilterDropdown
          label={t('action.filter_category')}
          options={CATEGORY_OPTIONS}
          selected={category}
          onChange={setCategory}
        />
        <SortDropdown options={SORT_OPTIONS} selected={sort} onChange={setSort} />
      </ActionBar>
    </>
  )
}
