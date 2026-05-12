'use client'

import { createBudgetItemAction } from '@/actions/budget/budget-item'
import { getCategoriesByUserAction } from '@/actions/category/get-categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CategorySelect } from '@/repository/categories'
import { Loader2, Plus, X } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

interface AddBudgetItemFormProps {
  groupId: string
  budgetId: string
}

export function AddBudgetItemForm({ groupId, budgetId }: AddBudgetItemFormProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [categories, setCategories] = useState<CategorySelect[]>([])

  const [name, setName] = useState('')
  const [plannedAmount, setPlannedAmount] = useState('')
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!open) return
    getCategoriesByUserAction().then(res => {
      if (res.success && res.data) setCategories(res.data as CategorySelect[])
    })
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amount = parseFloat(plannedAmount)
    if (!name.trim() || isNaN(amount) || amount < 0) {
      toast.error('Enter a valid name and amount')
      return
    }

    startTransition(async () => {
      const result = await createBudgetItemAction(
        { groupId, name: name.trim(), plannedAmount: amount, categoryId: categoryId || null },
        budgetId,
      )
      if (result.success) {
        toast.success(result.message ?? 'Item added')
        setName('')
        setPlannedAmount('')
        setCategoryId(undefined)
        setOpen(false)
      } else {
        toast.error(result.message ?? 'Failed to add item')
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className='flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors py-2 px-3'
      >
        <Plus className='size-3.5' />
        Add item
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className='border-t border-border pt-2 mt-2 px-3 pb-2 space-y-2'>
      <div className='flex items-end gap-2'>
        <div className='flex-1 space-y-1'>
          <Label htmlFor='item-name' className='text-[10px] uppercase tracking-wider text-muted-foreground'>
            Name
          </Label>
          <Input
            id='item-name'
            placeholder='e.g. Rent'
            value={name}
            onChange={e => setName(e.target.value)}
            className='h-8 text-xs'
            required
          />
        </div>

        <div className='w-28 space-y-1'>
          <Label htmlFor='item-amount' className='text-[10px] uppercase tracking-wider text-muted-foreground'>
            Amount
          </Label>
          <Input
            id='item-amount'
            placeholder='0.00'
            value={plannedAmount}
            onChange={e => setPlannedAmount(e.target.value)}
            className='h-8 text-xs text-right tabular-nums'
            type='number'
            step='0.01'
            min='0'
            required
          />
        </div>

        <div className='w-36 space-y-1'>
          <Label htmlFor='item-category' className='text-[10px] uppercase tracking-wider text-muted-foreground'>
            Category
          </Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id='item-category' className='h-8 text-xs'>
              <SelectValue placeholder='Optional' />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id} className='text-xs'>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='flex items-center justify-end gap-1.5'>
        <Button type='button' variant='ghost' size='sm' className='h-7 text-xs' onClick={() => setOpen(false)}>
          <X className='size-3 mr-1' />
          Cancel
        </Button>
        <Button type='submit' size='sm' className='h-7 text-xs gap-1' disabled={isPending}>
          {isPending ? <Loader2 className='size-3 animate-spin' /> : <Plus className='size-3' />}
          Add
        </Button>
      </div>
    </form>
  )
}
