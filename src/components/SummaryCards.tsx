import { Plus } from 'lucide-react'
import { Button } from './ui/button'

type Props = {
  activeView: string
}

export default function SummaryCards({ activeView }: Props) {
  if (activeView === 'income') {
    return (
      <div className='flex items-center justify-end gap-6'>
        <Button variant='default' className='bg-green-700' size='lg'>
          <Plus />
          Add New Income
        </Button>
      </div>
    )
  }

  return (
    <div className='flex items-center justify-end gap-6'>
      <Button variant='destructive' size='lg'>
        <Plus />
        Add New Expense
      </Button>
    </div>
  )
}
