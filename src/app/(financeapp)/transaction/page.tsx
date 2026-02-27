import { TransactionPageContent } from '@/components/TransactionPageContent'
import { Transaction } from '@/interfaces'

export default async function TransactionPage() {
  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'expense',
      amount: '100',
      payee: 'Transaction 1',
      date: new Date('2022-01-01'),
      categoryId: '1',
      accountId: '1',
      notes: 'Transaction 1',
      createdAt: new Date('2022-01-01'),
      updatedAt: new Date('2022-01-01'),
      userId: '1',
      accountName: 'Account 1',
      categoryName: 'Category 1',
      deletedAt: null,
    },
    {
      id: '2',
      type: 'income',
      amount: '200',
      payee: 'Transaction 2',
      date: new Date('2022-01-02'),
      categoryId: '2',
      accountId: '2',
      notes: 'Transaction 2',
      createdAt: new Date('2022-01-02'),
      updatedAt: new Date('2022-01-02'),
      userId: '2',
      accountName: 'Account 2',
      categoryName: 'Category 2',
      deletedAt: null,
    },
  ]

  return (
    <div className='max-w-screen-2xl h-full flex flex-col items-center justify-center mx-auto w-full'>
      <TransactionPageContent data={transactions} />
    </div>
  )
}
