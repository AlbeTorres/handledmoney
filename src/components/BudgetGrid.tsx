import type { Budget } from '@/interfaces'
import { BudgetCard } from './BudgetCard'
import { PiggyBank } from 'lucide-react'

interface BudgetGridProps {
  budgets: Budget[]
}

export function BudgetGrid({ budgets }: BudgetGridProps) {
  if (budgets.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-24 text-center'>
        <div className='size-16 rounded-2xl bg-muted flex items-center justify-center mb-4'>
          <PiggyBank className='size-8 text-muted-foreground' />
        </div>
        <h2 className='text-lg font-semibold text-foreground'>No budgets yet</h2>
        <p className='text-sm text-muted-foreground mt-1 max-w-xs'>
          Create your first zero-based budget to start tracking every dollar.
        </p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
      {budgets.map(budget => (
        <BudgetCard key={budget.id} budget={budget} />
      ))}
    </div>
  )
}
