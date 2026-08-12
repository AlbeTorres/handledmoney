import type { BudgetListItem } from '@/interfaces'
import { BudgetCard } from './BudgetCard'
import { PiggyBank } from 'lucide-react'

interface BudgetGridProps {
  budgets: BudgetListItem[]
  currentBudgetId?: string | null
}

export function BudgetGrid({ budgets, currentBudgetId }: BudgetGridProps) {
  if (budgets.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-24 text-center'>
        <div className='size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4'>
          <PiggyBank className='size-8 text-muted-foreground' />
        </div>
        <h2 className='title-md text-foreground'>No budgets yet</h2>
        <p className='text-sm text-muted-foreground mt-1 max-w-xs'>
          Create your first zero-based budget to start tracking every dollar.
        </p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'>
      {budgets.map(budget => (
          <BudgetCard key={budget.id} budget={budget} isCurrent={budget.id === currentBudgetId} />
      ))}
    </div>
  )
}
