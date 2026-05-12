'use client'

import { deleteBudgetGroupAction } from '@/actions/budget/budget-item'
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
import type { BudgetGroupWithItems } from '@/interfaces'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { AddBudgetItemForm } from './AddBudgetItemForm'
import { BudgetItemRow } from './BudgetItemRow'

interface BudgetGroupSectionProps {
  group: BudgetGroupWithItems
  budgetId: string
}

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  income: { label: 'Income', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
  bills: { label: 'Bills', color: 'text-red-600 bg-red-50 dark:bg-red-950/30' },
  variable_expenses: { label: 'Variable', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
  debt: { label: 'Debt', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' },
  savings: { label: 'Savings', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
  investments: { label: 'Investments', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
}

export function BudgetGroupSection({ group, budgetId }: BudgetGroupSectionProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [deletePending, startDeleteTransition] = useTransition()
  const typeInfo = TYPE_LABELS[group.type] ?? { label: group.type, color: 'text-muted-foreground bg-muted' }

  const handleDeleteGroup = () => {
    startDeleteTransition(async () => {
      const result = await deleteBudgetGroupAction(group.id, budgetId)
      if (result.success) {
        toast.success(result.message ?? 'Group deleted')
      } else {
        toast.error(result.message ?? 'Failed to delete group')
      }
    })
  }

  return (
    <div className='rounded-2xl border border-border bg-card overflow-hidden'>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className='w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left'
      >
        <div className='shrink-0 text-muted-foreground'>
          {collapsed ? <ChevronRight className='size-4' /> : <ChevronDown className='size-4' />}
        </div>

        <span className={cn('text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md', typeInfo.color)}>
          {typeInfo.label}
        </span>

        <span className='text-sm font-semibold text-foreground'>{group.name}</span>

        <div className='ml-auto flex items-center gap-3 text-xs tabular-nums'>
          <span className='text-muted-foreground'>Planned: <strong className='text-foreground'>{currency(group.groupPlanned)}</strong></span>
          <span className='text-muted-foreground'>Actual: <strong className={cn(group.groupActual > group.groupPlanned ? 'text-red-600' : 'text-emerald-600')}>{currency(group.groupActual)}</strong></span>
        </div>

        <Dialog>
          <DialogTrigger asChild onClick={e => e.stopPropagation()}>
            <Button
              size='icon'
              variant='ghost'
              className='size-7 shrink-0 text-muted-foreground hover:text-red-600'
            >
              <Trash2 className='size-3.5' />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete group</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &ldquo;{group.name}&rdquo;? All items inside will also be deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='outline'>Cancel</Button>
              </DialogClose>
              <Button variant='destructive' onClick={handleDeleteGroup} disabled={deletePending}>
                {deletePending ? 'Deleting\u2026' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </button>

      {!collapsed && (
        <div className='border-t border-border'>
          <div className='grid grid-cols-[1fr_104px_88px_88px_104px_40px] gap-0 px-3 pt-2 pb-1'>
            <span className='text-[10px] uppercase tracking-wider text-muted-foreground'>Item</span>
            <span className='text-[10px] uppercase tracking-wider text-muted-foreground text-right'>Planned</span>
            <span className='text-[10px] uppercase tracking-wider text-muted-foreground text-right'>Actual</span>
            <span className='text-[10px] uppercase tracking-wider text-muted-foreground text-right'>Remaining</span>
            <span className='text-[10px] uppercase tracking-wider text-muted-foreground text-right'>Usage</span>
            <span />
          </div>

          {group.items.length === 0 && (
            <p className='text-xs text-muted-foreground px-4 py-3 italic'>No items yet.</p>
          )}

          {group.items.map(item => (
            <BudgetItemRow key={item.id} item={item} budgetId={budgetId} />
          ))}

          <AddBudgetItemForm groupId={group.id} budgetId={budgetId} />
        </div>
      )}
    </div>
  )
}
