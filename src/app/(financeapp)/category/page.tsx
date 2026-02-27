import { getCategories } from '@/actions/category/get-categories'
import { CategoryContent } from '@/components/CategoryContent'

interface CategoryPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CategoryPage({ searchParams }: CategoryPageProps) {
  const result = await getCategories()
  const resolvedSearchParams = await searchParams
  const activeTab = (resolvedSearchParams.tab as 'expense' | 'income') || 'expense'

  return (
    <div className='bg-background-light dark:bg-background-dark'>
      <div className='container mx-auto py-8'>
        <div className='h-dvh bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col'>
          <h2 className='p-8 text-2xl font-bold tracking-tight text-center sm:text-left w-full'>
            Categories Overview
          </h2>
          <CategoryContent
            categories={result.data || []}
            activeTab={activeTab}
            title={activeTab === 'expense' ? 'Expenses' : 'Income'}
            description={
              activeTab === 'expense'
                ? 'Manage your spending categories effectively.'
                : 'Organize your different sources of income.'
            }
          />
        </div>
      </div>
    </div>
  )
}
