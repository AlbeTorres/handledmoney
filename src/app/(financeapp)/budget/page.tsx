import { getBudgetListAction } from '@/actions/budget/get-budget'
import { BudgetGrid } from '@/components/BudgetGrid'
import { CreateBudgetSheet } from '@/components/CreateBudgetSheet'

export const metadata = { title: 'Budgets | HandledMoney' }

export default async function BudgetPage() {
  const { data: budgets } = await getBudgetListAction()

  return (
    <div className='p-8 space-y-8 max-w-7xl mx-auto w-full'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>Budgets</h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Zero-based budget — every dollar assigned.
          </p>
        </div>
        <CreateBudgetSheet />
      </div>

      <BudgetGrid budgets={budgets ?? []} />
    </div>
  )
}
