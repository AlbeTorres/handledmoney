'use client'

import { deleteBudgetAction } from '@/actions/budget/delete-budget'
import { duplicateBudgetAction } from '@/actions/budget/duplicate-budget'
import { selectCurrentBudgetAction } from '@/actions/budget/select-current-budget'
import { DropDownActionMenu } from '@/components/DropDownActionMenu'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BudgetListItem } from '@/interfaces'
import { formatCurrency } from '@/lib/utils'
import { CalendarDays } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'

// Dates are stored as UTC-naive values, so format them as UTC to avoid
// shifting a day/month when the local time zone is behind UTC.
const date = (value: Date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value))

export type BudgetCardProps = {
  budget: BudgetListItem
  isCurrent?: boolean
}

export function BudgetCard({ budget, isCurrent = false }: BudgetCardProps) {
  const t = useTranslations('handledmoney.budget')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [duplicateOpen, setDuplicateOpen] = useState(false)
  const [duplicateName, setDuplicateName] = useState(`${budget.name} copy`)
  const [duplicateStartDate, setDuplicateStartDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  )
  const [deleteOpen, setDeleteOpen] = useState(false)

  // The REAL allocation rate drives the visible percentage (it may exceed
  // 100%); only the bar fill is clamped so it never overflows its track.
  const allocationRate =
    budget.totalIncome > 0 ? (budget.totalAllocated / budget.totalIncome) * 100 : 0
  const barPct = Math.min(allocationRate, 100)
  const balanceClass =
    budget.remainingToAllocate === 0
      ? 'text-success'
      : budget.remainingToAllocate < 0
        ? 'text-destructive'
        : 'text-warning'

  const openDetails = () => router.push(`/budget/${budget.id}`)

  const setCurrent = () =>
    startTransition(async () => {
      const result = await selectCurrentBudgetAction(budget.id)
      if (result.success) {
        toast.success(t('card.set_current_success'))
        router.refresh()
      } else {
        toast.error(t('form.error_generic'))
      }
    })

  const duplicate = () =>
    startTransition(async () => {
      const result = await duplicateBudgetAction({
        id: budget.id,
        name: duplicateName.trim(),
        startDate: new Date(`${duplicateStartDate}T00:00:00`),
      })
      if (result.success && result.data) {
        setDuplicateOpen(false)
        toast.success(t('card.duplicate_success'))
        router.push(`/budget/${result.data.id}`)
      } else {
        toast.error(t('form.error_generic'))
      }
    })

  const remove = () =>
    startTransition(async () => {
      const result = await deleteBudgetAction(budget.id)
      if (result.success) {
        setDeleteOpen(false)
        toast.success(t('card.delete_success'))
        router.refresh()
      } else {
        toast.error(t('form.error_generic'))
      }
    })

  return (
    <article className='group relative rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md'>
      {/* Stretch link: the whole card navigates to the budget; interactive
          controls render above it (see the z-10 content wrapper). */}
      <Link
        href={`/budget/${budget.id}`}
        aria-label={`${budget.name} — ${t('card.details')}`}
        className='absolute inset-0 z-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring'
      />
      <div className='relative z-10 flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <h2 className='title-md truncate text-foreground transition-colors group-hover:text-primary'>
            {budget.name}
          </h2>
          <p className='body-sm mt-1 flex items-center gap-1.5 text-muted-foreground'>
            <CalendarDays className='size-3.5' />
            {date(budget.startDate)}
            {budget.endDate ? ` – ${date(budget.endDate)}` : t('list.ongoing')}
          </p>
        </div>

        <DropDownActionMenu
          ariaLabel={t('card.options_aria')}
          actions={[
            { label: t('card.set_current'), onClick: setCurrent },
            { label: t('card.duplicate'), onClick: () => setDuplicateOpen(true) },
            { label: t('card.details'), onClick: openDetails },
            {
              label: t('card.delete_submit'),
              onClick: () => setDeleteOpen(true),
              variant: 'destructive',
            },
          ]}
        />
      </div>

      <div className='mt-7 grid grid-cols-2 gap-4'>
        <div>
          <p className='label-caps text-muted-foreground'>{t('list.planned_income')}</p>
          <p className='headline-lg mt-1 text-foreground'>{formatCurrency(budget.totalIncome)}</p>
        </div>
        <div>
          <p className='label-caps text-muted-foreground'>{t('list.allocated')}</p>
          <p className='headline-lg mt-1 text-foreground'>
            {formatCurrency(budget.totalAllocated)}
          </p>
        </div>
      </div>

      <div className='mt-6'>
        <div className='body-sm mb-2 flex items-center justify-between'>
          <span className='text-muted-foreground'>{t('list.ready_to_assign')}</span>
          <span className={`font-semibold tabular-nums ${balanceClass}`}>
            {formatCurrency(budget.remainingToAllocate)}
          </span>
        </div>
        <div
          role='progressbar'
          aria-label={t('list.assigned', { pct: Math.round(allocationRate) })}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(barPct)}
          className='h-2 overflow-hidden rounded-full bg-muted'
        >
          <div
            className='h-full rounded-full bg-primary transition-all'
            style={{ width: `${barPct}%` }}
          />
        </div>
        <div className='body-sm mt-3 flex items-center justify-between text-muted-foreground'>
          <span>{t('list.assigned', { pct: Math.round(allocationRate) })}</span>

          {isCurrent && (
            <span className='label-caps shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-primary'>
              {t('list.current')}
            </span>
          )}
        </div>
      </div>

      <Dialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('card.duplicate_dialog_title')}</DialogTitle>
            <DialogDescription>{t('card.duplicate_dialog_description')}</DialogDescription>
          </DialogHeader>
          <div className='grid gap-3 py-2'>
            <div className='grid gap-1 text-sm'>
              <Label>{t('card.duplicate_name')}</Label>
              <Input
                aria-label={t('card.duplicate_name')}
                value={duplicateName}
                onChange={event => setDuplicateName(event.target.value)}
              />
            </div>
            <div className='grid gap-1 text-sm'>
              <Label>{t('card.duplicate_start_date')}</Label>
              <Input
                aria-label={t('card.duplicate_start_date')}
                type='date'
                value={duplicateStartDate}
                onChange={event => setDuplicateStartDate(event.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>{t('card.cancel')}</Button>
            </DialogClose>
            <Button onClick={duplicate} disabled={isPending}>
              {t('card.duplicate_submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('card.delete_dialog_title')}</DialogTitle>
            <DialogDescription>
              {t('card.delete_dialog_description', { name: budget.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>{t('card.cancel')}</Button>
            </DialogClose>
            <Button variant='destructive' onClick={remove} disabled={isPending}>
              {t('card.delete_submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  )
}
