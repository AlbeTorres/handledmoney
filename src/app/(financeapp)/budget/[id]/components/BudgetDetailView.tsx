'use client'

import { deleteBudgetAction } from '@/actions/budget/delete-budget'
import { duplicateBudgetAction } from '@/actions/budget/duplicate-budget'
import { selectCurrentBudgetAction } from '@/actions/budget/select-current-budget'
import { updateBudgetAction } from '@/actions/budget/update-budget'
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
import { ArrowLeft, Copy, Loader2, Pencil, Star, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { BudgetGroupSection } from './BudgetGroupSection'
import { BudgetSummaryBar } from './BudgetSummaryBar'
import { AddBudgetGroupForm } from './AddBudgetGroupForm'

const formatDate = (date: Date) => new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(date))

interface BudgetDetailViewProps {
  budget: BudgetWithGroups
}

export function BudgetDetailView({ budget }: BudgetDetailViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(budget.name)
  const [startDate, setStartDate] = useState(() => new Date(budget.startDate).toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState(() => budget.endDate ? new Date(budget.endDate).toISOString().slice(0, 10) : '')
  const [duplicateOpen, setDuplicateOpen] = useState(false)
  const [duplicateName, setDuplicateName] = useState(`${budget.name} copy`)
  const [duplicateStartDate, setDuplicateStartDate] = useState(() => new Date().toISOString().slice(0, 10))

  const periodLabel = formatDate(budget.startDate)

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

  const saveMetadata = () => startTransition(async () => {
    const result = await updateBudgetAction({ id: budget.id, name: name.trim(), startDate: new Date(`${startDate}T00:00:00`), endDate: endDate ? new Date(`${endDate}T00:00:00`) : null })
    if (result.success) { setEditing(false); toast.success(result.message ?? 'Budget updated') }
    else toast.error(result.message ?? 'Failed to update budget')
  })

  const makeCurrent = () => startTransition(async () => {
    const result = await selectCurrentBudgetAction(budget.id)
    if (result.success) toast.success(result.message ?? 'Current budget updated')
    else toast.error(result.message ?? 'Failed to select budget')
  })

  const duplicate = () => startTransition(async () => {
    const result = await duplicateBudgetAction({ id: budget.id, name: duplicateName.trim(), startDate: new Date(`${duplicateStartDate}T00:00:00`) })
    if (result.success && result.data) { setDuplicateOpen(false); toast.success(result.message ?? 'Budget duplicated'); router.push(`/budget/${result.data.id}`) }
    else toast.error(result.message ?? 'Failed to duplicate budget')
  })

  return (
    <div className='space-y-7'>
      <div className='flex flex-col gap-5 lg:flex-row lg:items-start'>
        <Button variant='ghost' size='icon' asChild className='hidden shrink-0 lg:inline-flex'>
          <Link href='/budget' aria-label='Back to budgets'><ArrowLeft className='size-4' /></Link>
        </Button>
        <Link href='/budget' className='inline-flex w-fit items-center gap-2 body-sm text-muted-foreground hover:text-foreground lg:hidden'><ArrowLeft className='size-4' /> All budgets</Link>

        <div className='flex-1 min-w-0'>
          {editing ? <div className='grid max-w-xl gap-2 sm:grid-cols-3'><input aria-label='Budget name' value={name} onChange={event => setName(event.target.value)} className='rounded-md border bg-background px-3 py-2 font-semibold sm:col-span-3' /><input aria-label='Start date' type='date' value={startDate} onChange={event => setStartDate(event.target.value)} className='rounded-md border bg-background px-2 py-2 body-sm' /><input aria-label='End date' type='date' value={endDate} onChange={event => setEndDate(event.target.value)} min={startDate} className='rounded-md border bg-background px-2 py-2 body-sm' /><Button size='sm' onClick={saveMetadata} disabled={isPending}>Save changes</Button></div> : <><div className='flex flex-wrap items-center gap-3'><h1 className='display-lg truncate text-foreground'>{budget.name}</h1><span className='label-caps rounded-full bg-primary/15 px-2.5 py-1 text-primary'>Budget plan</span></div><p className='body-lg mt-1 text-muted-foreground'>{periodLabel}{budget.endDate ? ` – ${formatDate(budget.endDate)}` : ' – ongoing'}</p></>}
        </div>

        <div className='flex flex-wrap gap-2 lg:justify-end'>
        {!editing && <Button variant='outline' size='sm' className='gap-2' onClick={() => setEditing(true)}><Pencil className='size-4' /> Edit</Button>}
        <Button variant='outline' size='sm' className='gap-2' onClick={makeCurrent} disabled={isPending}><Star className='size-4' /> Set current</Button>
        <Dialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
          <DialogTrigger asChild><Button variant='outline' size='sm' className='gap-2'><Copy className='size-4' /> Duplicate</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Duplicate budget</DialogTitle><DialogDescription>Copy groups and planned items into a new historical budget.</DialogDescription></DialogHeader>
            <div className='grid gap-3 py-2'><label className='grid gap-1 text-sm'>Budget name<input aria-label='Duplicate budget name' value={duplicateName} onChange={event => setDuplicateName(event.target.value)} className='rounded border bg-background px-2 py-1' /></label><label className='grid gap-1 text-sm'>Start date<input aria-label='Duplicate start date' type='date' value={duplicateStartDate} onChange={event => setDuplicateStartDate(event.target.value)} className='rounded border bg-background px-2 py-1' required /></label></div>
            <DialogFooter><DialogClose asChild><Button variant='outline'>Cancel</Button></DialogClose><Button onClick={duplicate} disabled={isPending}>Duplicate budget</Button></DialogFooter>
          </DialogContent>
        </Dialog>

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
      </div>

      <BudgetSummaryBar
        totalIncome={budget.totalIncome}
        totalAllocated={budget.totalAllocated}
        remainingToAllocate={budget.remainingToAllocate}
      />

      <div className='space-y-4'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'><div><h2 className='headline-lg text-foreground'>Plan</h2><p className='body-sm text-muted-foreground'>Assign a monthly amount to every category.</p></div><AddBudgetGroupForm budgetId={budget.id} nextSortOrder={budget.groups.length} /></div>
        {budget.groups.map(group => (
          <BudgetGroupSection key={group.id} group={group} budgetId={budget.id} />
        ))}
      </div>
    </div>
  )
}
