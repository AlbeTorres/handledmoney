import { getBudgetWithActualsAction } from '@/actions/budget/get-budget'
import { BudgetDetailView } from '@/components/BudgetDetailView'
import { notFound } from 'next/navigation'

interface BudgetDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function BudgetDetailPage({ params }: BudgetDetailPageProps) {
  const { id } = await params
  const { data: budget, success } = await getBudgetWithActualsAction(id)

  if (!success || !budget) notFound()

  return (
    <div className='p-8 max-w-7xl mx-auto w-full'>
      <BudgetDetailView budget={budget} />
    </div>
  )
}
