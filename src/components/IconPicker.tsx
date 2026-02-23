'use client'
import {
  Bitcoin,
  Car,
  CreditCard,
  Home,
  LandmarkIcon,
  PiggyBank,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react'

interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
}

const ICONS = [
  { name: 'account_balance', label: 'Checkings', icon: <LandmarkIcon /> },
  { name: 'savings', label: 'Savings', icon: <PiggyBank /> },
  { name: 'credit_card', label: 'Credit Card', icon: <CreditCard /> },
  { name: 'trending_up', label: 'Investment', icon: <TrendingUp /> },
  { name: 'crypto', label: 'Crypto', icon: <Bitcoin /> },
  { name: 'shopping_cart', label: 'Shopping', icon: <ShoppingCart /> },
  { name: 'home', label: 'Home', icon: <Home /> },
  { name: 'car', label: 'Car', icon: <Car /> },
] as const

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div
      role='radiogroup'
      aria-label='Account icon'
      className='grid grid-cols-6 sm:grid-cols-8 gap-3'
    >
      {ICONS.map(icon => {
        const isSelected = value === icon.name
        return (
          <button
            key={icon.name}
            type='button'
            aria-label={icon.label}
            aria-pressed={isSelected}
            onClick={() => onChange(icon.name)}
            style={{ touchAction: 'manipulation' }}
            className={`aspect-square flex items-center justify-center rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isSelected
                ? 'bg-primary text-white ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span className='material-symbols-outlined' aria-hidden='true'>
              {icon.icon}
            </span>
          </button>
        )
      })}
    </div>
  )
}
