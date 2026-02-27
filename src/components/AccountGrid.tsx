import { getBankAccountsByUser } from '@/repository/account'
import { AccountCardWrapper } from './AccountCardWrapper'
import { AddAccountCard } from './AddAccountCard'

interface AccountGridProps {
  userId: string
  tab?: string
  sort?: string
  search?: string
}

export async function AccountGrid({ userId, tab, sort, search }: AccountGridProps) {
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
      const matchesTab = tab === 'All' || tab === 'default' || a.currency === tab
      const matchesSearch = !search || (a.name ?? '').toLowerCase().includes(search.toLowerCase())
      return matchesTab && matchesSearch
    })
    .sort((a, b) => {
      if (sort === 'Highest Balance') return (Number(b.balance) ?? 0) - (Number(a.balance) ?? 0)
      if (sort === 'Account Name') return (a.name ?? '').localeCompare(b.name ?? '')
      if (sort === 'Recently Added') return b.createdAt.getTime() - a.createdAt.getTime()
      return 0
    })

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      <AddAccountCard />
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
