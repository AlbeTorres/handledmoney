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
    <div className='group flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-muted/40 transition-colors'>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium text-foreground truncate'>{item.name}</span>
          {item.categoryId && (
            <span className='text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md'>
              mapped
            </span>
          )}
        </div>
      </div>

      <div className='flex items-center gap-4 shrink-0'>
        {editing ? (
          <div className='flex items-center gap-1'>
            <Input
              value={plannedAmount}
              onChange={e => setPlannedAmount(e.target.value)}
              className='h-8 w-24 text-xs text-right tabular-nums'
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
            className='text-sm font-medium tabular-nums text-foreground hover:text-primary transition-colors text-right w-24 opacity-0 group-hover:opacity-100'
          >
            <span className='opacity-100 group-hover:opacity-0 transition-opacity'>
              {currency(item.plannedAmount)}
            </span>
            <span className='absolute opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 justify-end w-24'>
              <Pencil className='size-3' />
              Edit
            </span>
          </button>
        )}

        <span className={cn('text-sm tabular-nums w-20 text-right', isOver ? 'text-red-600 font-medium' : 'text-muted-foreground')}>
          {currency(item.actualAmount)}
        </span>

        <span className={cn('text-sm tabular-nums w-20 text-right font-medium', isOver ? 'text-red-600' : item.remaining > 0 ? 'text-emerald-600' : 'text-muted-foreground')}>
          {currency(item.remaining)}
        </span>
      </div>

      <div className='w-24 shrink-0'>
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
            className='size-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-red-600'
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
