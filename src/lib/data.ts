export const ACCOUNT_TYPES = [
  { value: 'savings', label: 'Savings Account' },
  { value: 'checking', label: 'Checking Account' },
  { value: 'investment', label: 'Investment' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'cash', label: 'Cash / Wallet' },
] as const

export const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
] as const

export const EXPENSES = [
  {
    id: 1,
    date: '2023-10-24',
    time: '02:15 PM',
    payee: 'Starbucks Coffee #492',
    icon: 'coffee',
    category: 'Food & Drink',
    categoryColor: 'amber',
    amount: -6.5,
    receipt: true,
  },
  {
    id: 2,
    date: '2023-10-23',
    time: '10:00 AM',
    payee: 'Client Payment - Invoice #88',
    icon: 'payments',
    category: 'Income',
    categoryColor: 'emerald',
    amount: 2500,
    receipt: false,
  },
  {
    id: 3,
    date: '2023-10-22',
    time: '04:30 PM',
    payee: 'Apple Store - MacBook Pro Repair',
    icon: 'laptop_mac',
    category: 'Electronics',
    categoryColor: 'blue',
    amount: -1299,
    receipt: true,
  },
  {
    id: 4,
    date: '2023-10-21',
    time: '09:00 AM',
    payee: 'Monthly Rent Payment',
    icon: 'home',
    category: 'Housing',
    categoryColor: 'purple',
    amount: -2100,
    receipt: false,
  },
  {
    id: 5,
    date: '2023-10-20',
    time: '06:45 PM',
    payee: 'Whole Foods Market',
    icon: 'shopping_cart',
    category: 'Food & Drink',
    categoryColor: 'amber',
    amount: -184.22,
    receipt: true,
  },
  {
    id: 6,
    date: '2023-10-25',
    time: 'PENDING',
    payee: 'Shell Oil Station #22',
    icon: 'local_gas_station',
    category: 'Transport',
    categoryColor: 'slate',
    amount: -55,
    receipt: false,
    pending: true,
  },
]

export const INCOME = [
  {
    id: 1,
    category: 'Investment',
    date: '2025-01-01',
    total: 482.74,
    hours: 0,
    overtime: 0.0,
    taxFederal: 0,
    fica: 0,
    medicare: 0,
    rateHour: 0,
    gross: 552.0,
    rateOT: 16.0,
    rateOTpay: 0.0,
  },
  {
    id: 2,
    category: 'sidehustle',
    date: '2025-01-08',
    total: 746.28,
    hours: 40.0,
    overtime: 10.0,
    taxFederal: 133.72,
    fica: 66.4,
    medicare: 54.56,
    rateHour: 12.76,
    gross: 880.0,
    rateOT: 16.0,
    rateOTpay: 24.0,
  },
  {
    id: 3,
    category: 'work',
    date: '2025-01-15',
    total: 550.23,
    hours: 39.75,
    weeks: 0.99,
    overtime: 0.0,
    taxFederal: 85.77,
    fica: 37.12,
    medicare: 39.43,
    rateHour: 9.22,
    gross: 636.0,
    rateOT: 16.0,
    rateOTpay: 0.0,
  },
]

export const CATEGORY_COLORS = {
  amber: {
    badge:
      'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
  },
  emerald: {
    badge:
      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
  },
  blue: {
    badge:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
  },
  purple: {
    badge:
      'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/50',
  },
  slate: {
    badge:
      'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700',
  },
}

export const INCOME_COLS = [
  'Date',
  'Category',
  'Net Pay',
  'Hours',
  'OT Hrs',
  'Federal',
  'FICA',
  'Medicare',
  'Gross',
  '$/Hr',
  '$/OT',
]
