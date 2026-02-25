import { getBankAccountsByUser } from '@/repository/account'
import { AccountCardWrapper } from './AccountCardWrapper'
import { AddAccountCard } from './AddAccountCard'

interface AccountGridProps {
  userId: string
}

export async function AccountGrid({ userId }: AccountGridProps) {
  const accounts = await getBankAccountsByUser(userId)

  if (!accounts || accounts.length === 0) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <AddAccountCard />
      </div>
    )
  }

  const otherAccountsList = accounts.map(a => ({ id: a.id, name: a.name ?? 'Unnamed' }))

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {accounts.map(account => (
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
