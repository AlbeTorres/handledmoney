import CategoryAction from '@/app/(financeapp)/category/components/CategoryAction'
import { CategoryContent } from '@/app/(financeapp)/category/components/CategoryContent'
import { EmptyState } from '@/components/shared/EmptyState'
import { getCategoriesByUserAction } from '@/data-access/get-categories'
import { getTranslations } from 'next-intl/server'

interface CategoryPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CategoryPage({ searchParams }: CategoryPageProps) {
  const result = await getCategoriesByUserAction()

  const t = await getTranslations('handledmoney.category')

  const categories = result.data || []
  const resolvedSearchParams = await searchParams
  const activeType = resolvedSearchParams.type as ('expense' | 'income')[]
  const search = (resolvedSearchParams.search as string) || ''
  const sort = (resolvedSearchParams.sort as string) || 'default'

  if (!categories || categories.length === 0) {
    return (
      <div className='container flex w-full flex-col gap-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>{t('breadcrumbs.categories')}</h1>
          <p className='body-lg mt-1 text-muted-foreground'>
            Organize and classify your transactions by category.
          </p>
        </div>
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
    <div className='container flex w-full flex-col gap-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>{t('breadcrumbs.categories')}</h1>
        <p className='body-lg mt-1 text-muted-foreground'>
          Organize and classify your transactions by category.
        </p>
      </div>
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
