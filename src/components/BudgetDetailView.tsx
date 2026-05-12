'use client'

import { deleteBudgetAction } from '@/actions/budget/delete-budget'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import type { BudgetWithGroups } from '@/interfaces'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { BudgetGroupSection } from './BudgetGroupSection'
import { BudgetSummaryBar } from './BudgetSummaryBar'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface BudgetDetailViewProps {
  budget: BudgetWithGroups
}

export function BudgetDetailView({ budget }: BudgetDetailViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const monthLabel = MONTH_NAMES[budget.month - 1]

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteBudgetAction(budget.id)
      if (result.success) {
        toast.success(result.message ?? 'Budget deleted')
        router.push('/budget')
      } else {
        toast.error(result.message ?? 'Failed to delete budget')
      }
    })
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' asChild className='shrink-0'>
          <Link href='/budget'>
            <ArrowLeft className='size-4' />
          </Link>
        </Button>

        <div className='flex-1 min-w-0'>
          <h1 className='text-2xl font-bold text-foreground truncate'>{budget.name}</h1>
          <p className='text-sm text-muted-foreground'>{monthLabel} {budget.year}</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant='outline' size='sm' className='gap-2 text-red-600 hover:text-red-600'>
              {isPending ? <Loader2 className='size-4 animate-spin' /> : <Trash2 className='size-4' />}
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete budget</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &ldquo;{budget.name}&rdquo;? All groups and items will be permanently removed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='outline'>Cancel</Button>
              </DialogClose>
              <Button variant='destructive' onClick={handleDelete} disabled={isPending}>
                {isPending ? 'Deleting\u2026' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <BudgetSummaryBar
        totalIncome={budget.totalIncome}
        totalAllocated={budget.totalAllocated}
        remainingToAllocate={budget.remainingToAllocate}
      />

      <div className='space-y-3'>
        {budget.groups.map(group => (
          <BudgetGroupSection key={group.id} group={group} budgetId={budget.id} />
        ))}
      </div>
    </div>
  )
}
