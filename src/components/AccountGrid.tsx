import { Bitcoin, CreditCard, LandmarkIcon, PiggyBank } from 'lucide-react'
import { AccountCard } from './AccountCard'
import { AddAccountCard } from './AddAccountCard'

const ACCOUNTS = [
  {
    institution: 'Chase Bank',
    name: 'Sapphire Checking',
    balance: '$12,450',
    currency: 'USD',
    detail: '**** 4492',
    status: 'Active',
    statusVariant: 'active' as const,
    accentColor: '#3b82f6', // primary
    icon: <LandmarkIcon aria-hidden='true' />,
  },
  {
    institution: 'Revolut Ltd',
    name: 'Personal Savings',
    balance: '€5,200',
    decimal: '.50',
    currency: 'EUR',
    detail: 'revolut.me/user',
    status: 'Active',
    statusVariant: 'active' as const,
    accentColor: '#10b981', // emerald
    icon: <PiggyBank aria-hidden='true' />,
  },
  {
    institution: 'Binance Exchange',
    name: 'Trading Wallet',
    balance: '0.4582',
    decimal: '',
    currency: 'BTC',
    detail: '≈ $28,940.12 USD',
    status: 'Live',
    statusVariant: 'live' as const,
    accentColor: '#f59e0b', // amber
    icon: <Bitcoin aria-hidden='true' />,
  },
  {
    institution: 'American Express',
    name: 'Gold Card',
    balance: '-$2,145',
    decimal: '.20',
    currency: 'USD',
    detail: 'Pay by Jun 15',
    status: 'Payment Due',
    statusVariant: 'due' as const,
    accentColor: '#6366f1', // indigo
    icon: <CreditCard aria-hidden='true' />,
  },
]

export function AccountGrid() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {ACCOUNTS.map((account, index) => (
        <AccountCard key={index} {...account} />
      ))}
      <AddAccountCard />
    </div>
  )
}
