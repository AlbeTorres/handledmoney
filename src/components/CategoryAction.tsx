'use client'

import { useDebouncedSearchParam } from '@/hooks/use-debounced-search-params'
import { useFilterParam } from '@/hooks/use-filter-params'
import { useSortParam } from '@/hooks/use-sort-params'
import { useTranslations } from 'next-intl'
import ActionBar from './ActionBar'
import FilterDropdown from './FilterDropdown'
import SortDropdown from './SortDropdown'

export default function CategoryAction() {
  const [searchTerm, setSearchTerm] = useDebouncedSearchParam('search')
  const [sort, setSort] = useSortParam('sort')
  const [type, setType] = useFilterParam('type')
  const t = useTranslations('handledmoney.category')

  const VIEW_OPTIONS = [
    { label: t('filter.expenses'), value: 'expenses' },
    { label: t('filter.income'), value: 'income' },
  ]

  const SORT_OPTIONS = [
    { label: t('sort.category_name'), value: 'category_name' },
    { label: t('sort.recently_added'), value: 'recently_added' },
  ]

  return (
    <>
      <ActionBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        href='/category/create'
        id='category-search'
        placeholder={t('action.search_placeholder')}
        ariaLabel={t('action.search_placeholder')}
        buttonText={t('action.new_category')}
      >
        <FilterDropdown
          label={t('action.filter_view')}
          options={VIEW_OPTIONS}
          selected={type}
          onChange={setType}
        />
        <SortDropdown options={SORT_OPTIONS} selected={sort} onChange={setSort} />
      </ActionBar>
    </>
  )
}
