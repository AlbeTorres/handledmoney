import { BudgetDetailView } from './components/BudgetDetailView'
import { getBudgetWithActualsAction } from '@/data-access/get-budget'
import { notFound } from 'next/navigation'

interface BudgetDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function BudgetDetailPage({ params }: BudgetDetailPageProps) {
  const { id } = await params
  const { data: budget, success } = await getBudgetWithActualsAction(id)

  if (!success || !budget) notFound()

  return (
    <div className='container flex w-full flex-col gap-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10'>
      <BudgetDetailView budget={budget} />
    </div>
  )
}
