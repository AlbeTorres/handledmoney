import { Transaction } from '@/components/financeapp/interfaces'
import { TransactionPageContent } from '@/components/financeapp/TransactionPageContent'

const data: Transaction[] = [
  {
    id: '1',
    amount: 100,
    payee: 'Payee 1',
    accountId: '1',
    accountName: 'Account 1',
    categoryId: '1',
    categoryName: 'Category 1',
    notes: 'Notes 1',
    date: '2022-01-01',
  },
  {
    id: '4',
    amount: 100,
    payee: 'Payee 1',
    accountId: '1',
    accountName: 'Account 1',
    categoryId: '1',
    categoryName: 'Category 1',
    notes: 'Notes 1',
    date: '2022-01-01',
  },
  {
    id: '3',
    amount: 100,
    payee: 'Payee 1',
    accountId: '1',
    accountName: 'Account 1',
    categoryId: '1',
    categoryName: 'Category 1',
    notes: 'Notes 1',
    date: '2022-01-01',
  },
  {
    id: '7',
    amount: 10,
    payee: 'Payee 7',
    accountId: '7',
    accountName: 'Account 7',
    categoryId: '7',
    categoryName: 'Category 7',
    notes: 'Notes 7',
    date: '2022-01-01',
  },
]

export default function FinanceTestPage() {
  return (
    <div className='py-40'>
      <TransactionPageContent data={data} />
    </div>
  )
}
