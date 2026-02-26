import { getOrSeedCategories } from '@/actions/category/get-categories'
import { AppHeader } from '@/components/AppHeader'
import { CategoryList } from '@/components/categories/CategoryList'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface CategoryPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CategoryPage({ searchParams }: CategoryPageProps) {
  const result = await getOrSeedCategories()
  const resolvedSearchParams = await searchParams
  const activeTab = (resolvedSearchParams.tab as 'expense' | 'income') || 'expense'

  if (!result.success) {
    if (result.status === 401) {
      redirect('/login')
    }
    return (
      <div className='flex items-center justify-center h-screen'>
        <p className='text-red-500 font-bold'>{result.message}</p>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-screen bg-background-light dark:bg-background-dark'>
      <AppHeader title='Categories' />

      <main className='flex-1 overflow-hidden container mx-auto'>
        <div className='h-full flex flex-col md:flex-row gap-8 py-8'>
          {/* Main List Column */}
          <div className='flex-1 bg-white dark:bg-slate-900 md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col'>
            <div className='p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0'>
              <div>
                <h2 className='text-lg font-bold'>Your Categories</h2>
                <p className='text-xs text-slate-500'>Click to edit or manage hierarchy</p>
              </div>
              <Link
                href='/category/create'
                className='flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all'
              >
                <Plus className='size-4' />
                New Category
              </Link>
            </div>

            <CategoryList
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

          {/* Tips / Info Column (Visible on Desktop) */}
          <div className='hidden lg:flex w-80 flex-col gap-6'>
            <div className='p-6 bg-primary/5 rounded-3xl border border-primary/10'>
              <h4 className='font-bold text-primary mb-2'>Hierarchy Tip</h4>
              <p className='text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium'>
                Organize your finances better by creating subcategories. For example,
                <strong>"Housing"</strong> as parent and <strong>"Rent"</strong> as child.
              </p>
            </div>
            <div className='p-6 bg-slate-100 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800'>
              <h4 className='font-bold mb-2'>Why Categories?</h4>
              <p className='text-xs text-slate-500 leading-relaxed font-medium'>
                Categorizing your transactions allows you to see exactly where your money goes and
                helps you build a more accurate budget.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
