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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

const MONTHS = [
  { value: '1', label: 'January' }, { value: '2', label: 'February' },
  { value: '3', label: 'March' }, { value: '4', label: 'April' },
  { value: '5', label: 'May' }, { value: '6', label: 'June' },
  { value: '7', label: 'July' }, { value: '8', label: 'August' },
  { value: '9', label: 'September' }, { value: '10', label: 'October' },
  { value: '11', label: 'November' }, { value: '12', label: 'December' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 1 + i)

export function CreateBudgetSheet() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState('')
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [year, setYear] = useState(String(CURRENT_YEAR))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const result = await createBudgetAction({
        name,
        month: Number(month),
        year: Number(year),
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
            Set up a zero-based budget for a specific month.
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
              <Label htmlFor='budget-month'>Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger id='budget-month'>
                  <SelectValue placeholder='Month' />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='budget-year'>Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger id='budget-year'>
                  <SelectValue placeholder='Year' />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
