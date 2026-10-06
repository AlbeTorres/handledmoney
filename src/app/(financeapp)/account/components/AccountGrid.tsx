import { Account } from '@/interfaces'
import { AccountCardWrapper } from './AccountCardWrapper'

interface AccountGridProps {
  accounts: Account[]
  currency?: string[]
  sort?: string
  search?: string
}

export async function AccountGrid({ accounts, currency, sort, search }: AccountGridProps) {
  const otherAccountsList = accounts.map(a => ({ id: a.id, name: a.name ?? 'Unnamed' }))

  const filteredAccounts = accounts
    .filter(a => {
      const matchesCurrency = !currency || currency.length === 0 || currency.includes(a.currency)
      const matchesSearch = !search || (a.name ?? '').toLowerCase().includes(search.toLowerCase())
      return matchesCurrency && matchesSearch
    })
    .sort((a, b) => {
      if (sort === 'highest_balance') return (Number(b.balance) ?? 0) - (Number(a.balance) ?? 0)
      if (sort === 'account_name') return (a.name ?? '').localeCompare(b.name ?? '')
      if (sort === 'recently_added') return b.createdAt.getTime() - a.createdAt.getTime()
      return 0
    })

  return (
    <>
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
    </>
  )
}
