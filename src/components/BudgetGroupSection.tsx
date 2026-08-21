'use client'

import { deleteBudgetGroupAction, updateBudgetGroupAction } from '@/actions/budget/budget-item'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { BudgetGroupWithItems } from '@/interfaces'
import { cn } from '@/lib/utils'
import { Check, ChevronDown, ChevronRight, Pencil, Trash2, X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { AddBudgetItemForm } from './AddBudgetItemForm'
import { BudgetItemRow } from './BudgetItemRow'

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export function BudgetGroupSection({
  group,
  budgetId,
}: {
  group: BudgetGroupWithItems
  budgetId: string
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(group.name)
  const [deletePending, startDeleteTransition] = useTransition()
  const [renamePending, startRenameTransition] = useTransition()
  const isIncome = group.calculationType === 'income'
  const actualTone =
    group.groupActual > group.groupPlanned ? 'text-destructive' : 'text-emerald-700'

  const rename = () => {
    if (!name.trim()) return
    startRenameTransition(async () => {
      const result = await updateBudgetGroupAction({ id: group.id, name: name.trim() }, budgetId)
      if (result.success) {
        setEditingName(false)
        toast.success(result.message ?? 'Group updated')
      } else toast.error(result.message ?? 'Failed to update group')
    })
  }
  const remove = () =>
    startDeleteTransition(async () => {
      const result = await deleteBudgetGroupAction(group.id, budgetId)
      if (result.success) toast.success(result.message ?? 'Group deleted')
      else toast.error(result.message ?? 'Failed to delete group')
    })

  return (
    <section className='overflow-hidden rounded-xl border border-border bg-card'>
      <div className='flex min-h-16 items-center gap-3 px-4 py-3 sm:px-5'>
        <button
          aria-label={`Toggle ${group.name}`}
          onClick={() => setCollapsed(value => !value)}
          className='rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
        >
          {collapsed ? <ChevronRight className='size-4' /> : <ChevronDown className='size-4' />}
        </button>
        <span
          className={cn(
            'label-caps rounded-full px-2 py-1',
            isIncome
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
          )}
        >
          {isIncome ? 'Income' : 'Outflow'}
        </span>
        <div className='min-w-0 flex-1'>
          {editingName ? (
            <div className='flex items-center gap-1'>
              <input
                aria-label='Group name'
                value={name}
                onChange={event => setName(event.target.value)}
                className='h-8 w-full max-w-56 rounded-md border bg-background px-2 body-sm font-semibold'
                autoFocus
              />
              <Button
                size='icon'
                variant='ghost'
                aria-label='Save group name'
                className='size-8'
                onClick={rename}
                disabled={renamePending}
              >
                <Check className='size-3.5' />
              </Button>
              <Button
                size='icon'
                variant='ghost'
                aria-label='Cancel group rename'
                className='size-8'
                onClick={() => {
                  setName(group.name)
                  setEditingName(false)
                }}
              >
                <X className='size-3.5' />
              </Button>
            </div>
          ) : (
            <h2 className='title-md truncate text-foreground'>{group.name}</h2>
          )}
        </div>
        <div className='hidden text-right sm:block'>
          <p className='label-caps text-muted-foreground'>Planned</p>
          <p className='body-sm font-semibold tabular-nums'>{currency(group.groupPlanned)}</p>
        </div>
        <div className='hidden text-right md:block'>
          <p className='label-caps text-muted-foreground'>Actual</p>
          <p className={cn('body-sm font-semibold tabular-nums', actualTone)}>
            {currency(group.groupActual)}
          </p>
        </div>
        {!editingName && (
          <Button
            size='icon'
            variant='ghost'
            aria-label={`Rename ${group.name}`}
            className='size-8 text-muted-foreground'
            onClick={() => setEditingName(true)}
          >
            <Pencil className='size-3.5' />
          </Button>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size='icon'
              variant='ghost'
              aria-label={`Delete ${group.name}`}
              className='size-8 text-muted-foreground hover:text-destructive'
            >
              <Trash2 className='size-3.5' />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete group</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &ldquo;{group.name}&rdquo;? All items inside will
                also be deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='outline'>Cancel</Button>
              </DialogClose>
              <Button variant='destructive' onClick={remove} disabled={deletePending}>
                {deletePending ? 'Deleting…' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {!collapsed && (
        <div className='border-t border-border'>
          <div className='overflow-x-auto'>
            <div className='min-w-[620px]'>
              <div className='grid grid-cols-[minmax(180px,1fr)_104px_88px_88px_104px_40px] gap-0 border-b border-border bg-muted/40 px-4 py-2 sm:px-5'>
                <span className='label-caps text-muted-foreground'>Category</span>
                <span className='label-caps text-right text-muted-foreground'>Planned</span>
                <span className='label-caps text-right text-muted-foreground'>Actual</span>
                <span className='label-caps text-right text-muted-foreground'>Remaining</span>
                <span className='label-caps text-right text-muted-foreground'>Usage</span>
                <span />
              </div>
              {group.items.length === 0 && (
                <p className='px-5 py-5 body-sm italic text-muted-foreground'>
                  No categories assigned yet.
                </p>
              )}
              {group.items.map(item => (
                <BudgetItemRow key={item.id} item={item} budgetId={budgetId} />
              ))}
            </div>
          </div>
          <AddBudgetItemForm
            groupId={group.id}
            budgetId={budgetId}
            calculationType={group.calculationType}
          />
        </div>
      )}
    </section>
  )
}
