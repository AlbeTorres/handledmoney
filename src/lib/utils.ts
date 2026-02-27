import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ICONS } from './data'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fmt = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-')
  return new Date(+y, +m - 1, +d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const getIconComponent = (iconName: string) => {
  const iconData = ICONS.find(i => i.name === (iconName || 'account_balance'))
  return iconData?.icon ?? ICONS[0].icon
}
