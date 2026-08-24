import CategoryAction from '@/components/CategoryAction'
import { CategoryContent } from '@/components/CategoryContent'
import { EmptyState } from '@/components/EmptyState'
import { getCategoriesByUserData } from '@/data-access/get-categories'
import { getTranslations } from 'next-intl/server'

interface CategoryPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CategoryPage({ searchParams }: CategoryPageProps) {
  const result = await getCategoriesByUserData()

  const t = await getTranslations('handledmoney.category')

  const categories = result.data || []
  const resolvedSearchParams = await searchParams
  const activeType = resolvedSearchParams.type as ('expense' | 'income')[]
  const search = (resolvedSearchParams.search as string) || ''
  const sort = (resolvedSearchParams.sort as string) || 'default'

  if (!categories || categories.length === 0) {
    return (
      <div className='m-auto flex  flex-col justify-center items-center gap-4'>
        <EmptyState
          title={t('empty_state.title')}
          description={t('empty_state.description')}
          primaryActionText={t('empty_state.add_first_category')}
          onPrimaryActionHref='/category/create'
          showImportButton={false}
        />
      </div>
    )
  }

  return (
    <div className='px-8 py-10 my-5 flex flex-col gap-y-10 container'>
      <CategoryAction />
      <CategoryContent
        sort={sort}
        search={search}
        categories={categories}
        activeType={activeType}
      />
    </div>
  )
}
