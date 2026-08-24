import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ICONS } from './data'
import { DashboardPeriod } from './schema'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fmt = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Safe Intl currency formatter. Amounts are numeric strings from the DB, so
// Number() is applied at the boundary. Falls back to plain toLocaleString
// when the currency code is invalid for the current ICU build.
export const formatMoney = (amount: number | string, currency = 'USD'): string => {
  const code = currency?.toUpperCase() || 'USD'
  try {
    return Number(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  } catch {
    return Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
}


// Local formatter, consistent with the en-US/USD pattern used across the
// budget components. Configurable currency is out of scope for now.
export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

// Progress bars use the REAL percentage as visible text (it may exceed 100%),
// while the bar fill is clamped so it never overflows its track.
export const formatPercentage = (percentage: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(percentage) + '%'



export const fmtDate = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const getIconComponent = (iconName: string) => {
  const iconData = ICONS.find(i => i.name === (iconName || 'account_balance'))
  return iconData?.icon ?? ICONS[0].icon
}

export function utcRange(period: DashboardPeriod): { start: Date; nextStart: Date } {
  const start =
    period.mode === 'monthly' && period.month !== undefined
      ? new Date(Date.UTC(period.year, period.month, 1))
      : new Date(Date.UTC(period.year, 0, 1))
  const nextStart =
    period.mode === 'monthly' && period.month !== undefined
      ? new Date(Date.UTC(period.year, period.month + 1, 1))
      : new Date(Date.UTC(period.year + 1, 0, 1))
  return { start, nextStart }
}
