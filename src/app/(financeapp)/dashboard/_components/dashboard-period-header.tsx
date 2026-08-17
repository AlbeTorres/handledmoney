'use client'

import type { DashboardPeriod } from '@/lib/finance-data'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

const MIN_YEAR = 2000
const MAX_YEAR = 2100

type DashboardPeriodHeaderProps = {
  period: DashboardPeriod
  netActual: number
}

export function toDashboardPeriodQuery(period: DashboardPeriod): string {
  const query = new URLSearchParams({ mode: period.mode, year: String(period.year) })
  if (period.mode === 'monthly') query.set('month', String(period.month))
  return query.toString()
}

export function hrefForPeriod(pathname: string, period: DashboardPeriod): string {
  return `${pathname}?${toDashboardPeriodQuery(period)}`
}

export function previousPeriod(period: DashboardPeriod): DashboardPeriod {
  if (period.year === MIN_YEAR && (period.mode === 'annual' || period.month === 0)) return period
  if (period.mode === 'annual') return { mode: 'annual', year: period.year - 1 }
  return period.month === 0
    ? { mode: 'monthly', year: period.year - 1, month: 11 }
    : { ...period, month: period.month - 1 }
}

export function nextPeriod(period: DashboardPeriod): DashboardPeriod {
  if (period.year === MAX_YEAR && (period.mode === 'annual' || period.month === 11)) return period
  if (period.mode === 'annual') return { mode: 'annual', year: period.year + 1 }
  return period.month === 11
    ? { mode: 'monthly', year: period.year + 1, month: 0 }
    : { ...period, month: period.month + 1 }
}

function switchMode(period: DashboardPeriod, mode: DashboardPeriod['mode']): DashboardPeriod {
  if (mode === period.mode) return period
  if (mode === 'annual') return { mode, year: period.year }
  return { mode, year: period.year, month: new Date().getUTCMonth() }
}

function periodLabel(period: DashboardPeriod): string {
  if (period.mode === 'annual') return String(period.year)
  return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(period.year, period.month, 1)))
}

function balanceLabel(netActual: number): string {
  if (netActual > 0) return 'Superávit'
  if (netActual < 0) return 'Déficit'
  return 'Balance neutro'
}

export function DashboardPeriodHeader({ period, netActual }: DashboardPeriodHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [requestedPeriod, setRequestedPeriod] = useState<DashboardPeriod | null>(null)
  const label = periodLabel(period)
  const controlsDisabled = isPending
  const announcement = requestedPeriod && toDashboardPeriodQuery(requestedPeriod) === toDashboardPeriodQuery(period)
    ? `Período actualizado: ${label}`
    : null

  function navigate(target: DashboardPeriod) {
    if (toDashboardPeriodQuery(target) === toDashboardPeriodQuery(period)) return
    setRequestedPeriod(target)
    startTransition(() => router.push(hrefForPeriod(pathname, target)))
  }

  const previous = previousPeriod(period)
  const next = nextPeriod(period)

  return (
    <section aria-busy={controlsDisabled} aria-label='Presupuesto vs Realidad' className='rounded-xl border border-border bg-card p-5'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>Presupuesto vs Realidad</h1>
          <p className='mt-1 text-sm text-muted-foreground'>Compara tus flujos estimados contra tu desempeño real.</p>
        </div>
        <div className='rounded-lg bg-muted px-4 py-3' aria-label={balanceLabel(netActual)}>
          <p className='text-sm font-semibold'>{balanceLabel(netActual)}</p>
        </div>
      </div>

      <div className='mt-5 flex flex-wrap items-center gap-2'>
        <button type='button' onClick={() => navigate(previous)} disabled={controlsDisabled || previous === period}>Período anterior</button>
        <p className='min-w-36 text-center font-semibold' aria-label={`Período seleccionado: ${label}`}>{label}</p>
        <button type='button' onClick={() => navigate(next)} disabled={controlsDisabled || next === period}>Período siguiente</button>
        <div role='group' aria-label='Modo del período' className='ml-auto flex gap-2'>
          <button type='button' aria-pressed={period.mode === 'monthly'} disabled={controlsDisabled} onClick={() => navigate(switchMode(period, 'monthly'))}>Mensual</button>
          <button type='button' aria-pressed={period.mode === 'annual'} disabled={controlsDisabled} onClick={() => navigate(switchMode(period, 'annual'))}>Anual</button>
        </div>
      </div>
      {announcement && <p role='status' aria-live='polite' className='sr-only'>{announcement}</p>}
    </section>
  )
}
