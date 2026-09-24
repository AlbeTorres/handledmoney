import { BudgetGrid } from '@/app/(financeapp)/budget/_components/BudgetGrid'
import { Button } from '@/components/ui/button'
import { getBudgetListAction } from '@/data-access/get-budget'
import { getCurrentBudgetAction } from '@/data-access/get-current-budget'
import { Plus } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export const metadata = { title: 'Budgets' }

export default async function BudgetPage() {
  const t = await getTranslations('handledmoney.budget')
  const [{ data: budgets }, { data: currentBudget }] = await Promise.all([
    getBudgetListAction(),
    getCurrentBudgetAction(),
  ])

  return (
    <div className='container space-y-10 px-4 py-6 sm:px-6 lg:px-10 lg:py-10'>
      <div className='flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='display-lg text-foreground'>{t('list.title')}</h1>
          <p className='body-lg mt-1 text-muted-foreground'>{t('list.description')}</p>
        </div>
        <Button asChild className='gap-2'>
          <Link href='/budget/create'>
            <Plus className='size-4' />
            {t('list.new_budget')}
          </Link>
        </Button>
      </div>
      <BudgetGrid budgets={budgets ?? []} currentBudgetId={currentBudget?.budgetId ?? null} />
    </div>
  )
}
