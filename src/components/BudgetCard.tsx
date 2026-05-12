'use client'

import type { Budget } from '@/interfaces'
import { CalendarDays, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface BudgetCardProps {
  budget: Budget
}

export function BudgetCard({ budget }: BudgetCardProps) {
  const monthLabel = MONTH_NAMES[budget.month - 1]

  return (
    <Link
      href={`/budget/${budget.id}`}
      className='flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:shadow-md hover:border-primary/40 transition-all group'
    >
      <div className='size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0'>
        <CalendarDays className='size-5 text-primary' />
      </div>

      <div className='flex-1 min-w-0'>
        <h3 className='font-semibold text-sm text-foreground truncate'>{budget.name}</h3>
        <p className='text-xs text-muted-foreground mt-0.5'>
          {monthLabel} {budget.year}
        </p>
      </div>

      <ChevronRight className='size-4 text-muted-foreground transition-transform group-hover:translate-x-1 shrink-0' />
    </Link>
  )
}
