'use client'

import { createBudgetAction } from '@/actions/budget/create-budget'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Plus } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

const today = () => new Date().toISOString().slice(0, 10)

export function CreateBudgetSheet() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const result = await createBudgetAction({
        name,
        startDate: new Date(`${startDate}T00:00:00`),
        endDate: endDate ? new Date(`${endDate}T00:00:00`) : null,
      })

      if (result.success) {
        toast.success(result.message)
        setOpen(false)
        setName('')
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className='gap-2'>
          <Plus className='size-4' />
          New Budget
        </Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create Budget</SheetTitle>
          <SheetDescription>
            Set up a zero-based budget for your current financial reality.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className='mt-6 space-y-5 px-4'>
          <div className='space-y-2'>
            <Label htmlFor='budget-name'>Budget name</Label>
            <Input
              id='budget-name'
              placeholder='e.g. May 2026 Budget'
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <Label htmlFor='budget-start-date'>Start date</Label>
              <Input id='budget-start-date' type='date' value={startDate} onChange={event => setStartDate(event.target.value)} required />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='budget-end-date'>End date</Label>
              <Input id='budget-end-date' type='date' value={endDate} onChange={event => setEndDate(event.target.value)} min={startDate} />
            </div>
          </div>

          <Button type='submit' className='w-full mt-2' disabled={isPending}>
            {isPending ? 'Creating…' : 'Create Budget'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
