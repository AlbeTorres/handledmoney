import { getTransactionByIdAction } from '@/actions/transaction/get-transaction'
import { Breadcrumb } from '@/components/Breadcrumb'
import { TransactionDetailAttachments } from '@/components/TransactionDetailAttachments'
import { TransactionDetailExpenseBreakdown } from '@/components/TransactionDetailExpenseBreakdown'
import { TransactionDetailHeader } from '@/components/TransactionDetailHeader'
import { TransactionDetailIncomeBreakdown } from '@/components/TransactionDetailIncomeBreakdown'
import { TransactionDetailInfoGrid } from '@/components/TransactionDetailInfoGrid'
import { TransactionDetailMetadata } from '@/components/TransactionDetailMetadata'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

interface TransactionDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TransactionDetailPage({ params }: TransactionDetailPageProps) {
  const { id } = await params
  const t = await getTranslations('handledmoney.transaction')

  const response = await getTransactionByIdAction(id)

  if (!response.success || !response.data || response.status === 401) {
    notFound()
  }

  const transaction = response.data

  return (
    <div className='container mx-auto space-y-6 p-8'>
      <Breadcrumb
        pathTitle={transaction.payee}
        oldPath='/transaction'
        oldPathTitle={t('breadcrumbs.transactions')}
      />

      <TransactionDetailHeader
        id={transaction.id}
        type={transaction.type}
        amount={transaction.amount}
        payee={transaction.payee}
        date={transaction.date}
        account={{
          bank: transaction.account.bank,
          name: transaction.account.name,
          currency: transaction.account.currency,
          icon: transaction.account.icon,
        }}
      />

      <TransactionDetailInfoGrid
        payee={transaction.payee}
        category={transaction.category}
        notes={transaction.notes}
      />

      {transaction.type === 'income' ? (
        <TransactionDetailIncomeBreakdown
          incomeDetails={
            transaction.incomeDetails
              ? {
                  incomeType: transaction.incomeDetails.incomeType,
                  billingType: transaction.incomeDetails.billingType,
                  grossAmount: transaction.incomeDetails.grossAmount,
                  taxesWithheld: transaction.incomeDetails.taxesWithheld,
                  taxBreakdown: (transaction.incomeDetails.taxBreakdown ?? null) as Record<
                    string,
                    number | string
                  > | null,
                }
              : null
          }
        />
      ) : (
        <TransactionDetailExpenseBreakdown
          expenseDetails={
            transaction.expenseDetails
              ? {
                  salesTax: transaction.expenseDetails.salesTax,
                  taxRate: transaction.expenseDetails.taxRate,
                  isDeductible: transaction.expenseDetails.isDeductible,
                  deductionCategory: transaction.expenseDetails.deductionCategory,
                }
              : null
          }
        />
      )}

      <TransactionDetailAttachments />
      <TransactionDetailMetadata id={transaction.id} createdAt={transaction.createdAt} />
    </div>
  )
}
