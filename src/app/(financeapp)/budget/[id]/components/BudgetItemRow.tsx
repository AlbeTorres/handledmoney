'use client'

import { updateBudgetItemAction, deleteBudgetItemAction } from '@/actions/budget/budget-item'
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
import { Input } from '@/components/ui/input'
import type { BudgetItemWithActual } from '@/interfaces'
import { cn } from '@/lib/utils'
import { Loader2, Pencil, Trash2, X, Check } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface BudgetItemRowProps {
  item: BudgetItemWithActual
  budgetId: string
}

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export function BudgetItemRow({ item, budgetId }: BudgetItemRowProps) {
  const [editing, setEditing] = useState(false)
  const [plannedAmount, setPlannedAmount] = useState(String(item.plannedAmount))
  const [isPending, startTransition] = useTransition()
  const [deletePending, startDeleteTransition] = useTransition()

  const isOver = item.remaining < 0
  const usagePct = isNaN(item.usageRate) ? 0 : Math.min(item.usageRate * 100, 100)

  const handleSave = () => {
    const val = parseFloat(plannedAmount)
    if (isNaN(val) || val < 0) {
      toast.error('Enter a valid amount')
      return
    }

    startTransition(async () => {
      const result = await updateBudgetItemAction({ id: item.id, plannedAmount: val }, budgetId)
      if (result.success) {
        setEditing(false)
        toast.success(result.message ?? 'Item updated')
      } else {
        toast.error(result.message ?? 'Failed to update item')
      }
    })
  }

  const handleCancel = () => {
    setPlannedAmount(String(item.plannedAmount))
    setEditing(false)
  }

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteBudgetItemAction(item.id, budgetId)
      if (result.success) {
        toast.success(result.message ?? 'Item deleted')
      } else {
        toast.error(result.message ?? 'Failed to delete item')
      }
    })
  }

  return (
    <div className='group grid grid-cols-[minmax(180px,1fr)_104px_88px_88px_104px_40px] items-center gap-0 px-4 py-2.5 transition-colors hover:bg-muted/40 sm:px-5'>
      <div className='min-w-0'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium text-foreground truncate'>{item.name}</span>
          {item.categoryId && (
            <span className='text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md'>
              mapped
            </span>
          )}
        </div>
      </div>

      <div className='flex justify-end'>
        {editing ? (
          <div className='flex items-center gap-1'>
            <Input
              value={plannedAmount}
              onChange={e => setPlannedAmount(e.target.value)}
              className='h-8 w-20 text-xs text-right tabular-nums'
              type='number'
              step='0.01'
              min='0'
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') handleCancel()
              }}
            />
            <Button
              size='icon'
              variant='ghost'
              className='size-7'
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? <Loader2 className='size-3 animate-spin' /> : <Check className='size-3' />}
            </Button>
            <Button size='icon' variant='ghost' className='size-7' onClick={handleCancel} disabled={isPending}>
              <X className='size-3' />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            aria-label={`Edit planned amount for ${item.name}`}
            className='text-right body-sm font-medium tabular-nums text-foreground transition-colors hover:text-primary'
          >
            <span className='inline-flex items-center gap-1'>{currency(item.plannedAmount)}<Pencil className='size-3 opacity-0 transition-opacity group-hover:opacity-100' /></span>
          </button>
        )}
      </div>

      <span className={cn('body-sm tabular-nums text-right', isOver ? 'font-medium text-destructive' : 'text-muted-foreground')}>{currency(item.actualAmount)}</span>
      <span className={cn('body-sm text-right font-medium tabular-nums', isOver ? 'text-destructive' : item.remaining > 0 ? 'text-emerald-700' : 'text-muted-foreground')}>{currency(item.remaining)}</span>

      <div className='px-3'>
        <div className='h-1.5 w-full rounded-full bg-muted overflow-hidden'>
          <div
            className={cn(
              'h-full rounded-full transition-all',
              usagePct > 100 ? 'bg-red-500' : usagePct > 75 ? 'bg-amber-500' : 'bg-emerald-500',
            )}
            style={{ width: `${usagePct}%` }}
          />
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            size='icon'
            variant='ghost'
          aria-label={`Delete ${item.name}`}
          className='size-7 justify-self-end opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive focus-visible:opacity-100'
          >
            <Trash2 className='size-3.5' />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{item.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DialogClose>
            <Button variant='destructive' onClick={handleDelete} disabled={deletePending}>
              {deletePending ? 'Deleting\u2026' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
