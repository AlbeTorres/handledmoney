import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ICONS } from './data'

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
