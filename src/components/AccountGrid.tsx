import { getBankAccountsByUser } from '@/repository/account'
import { AccountCardWrapper } from './AccountCardWrapper'
import { AddAccountCard } from './AddAccountCard'

interface AccountGridProps {
  userId: string
  tab?: string
  sort?: string
}

export async function AccountGrid({ userId, tab, sort }: AccountGridProps) {
  const accounts = await getBankAccountsByUser(userId)

  if (!accounts || accounts.length === 0) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <AddAccountCard />
      </div>
    )
  }

  const otherAccountsList = accounts.map(a => ({ id: a.id, name: a.name ?? 'Unnamed' }))

  const filteredAccounts = accounts
    .filter(a => {
      if (tab === 'All Accounts' || tab === 'default') return true
      return a.currency === tab
    })
    .sort((a, b) => {
      if (sort === 'Highest Balance') return (Number(b.balance) ?? 0) - (Number(a.balance) ?? 0)
      if (sort === 'Account Name') return (a.name ?? '').localeCompare(b.name ?? '')
      if (sort === 'Recently Added') return b.createdAt.getTime() - a.createdAt.getTime()
      return 0
    })

  if (filteredAccounts.length === 0) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <AddAccountCard />
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {filteredAccounts.map(account => (
        <AccountCardWrapper
          key={account.id}
          account={account}
          hasTransactions={account.transactionsCount > 0}
          otherAccounts={otherAccountsList.filter(a => a.id !== account.id)}
        />
      ))}
    </div>
  )
}
