'use client'

import { createBudgetItemAction } from '@/actions/budget/budget-item'
import { createCategoryAction } from '@/actions/category/create-category'
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
import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

interface AddBudgetItemFormProps {
  groupId: string
  budgetId: string
  calculationType: 'income' | 'outflow'
}

export function AddBudgetItemForm({ groupId, budgetId, calculationType }: AddBudgetItemFormProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [categories, setCategories] = useState<CategorySelect[]>([])

  const [name, setName] = useState('')
  const [plannedAmount, setPlannedAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const selectedCategoryIdRef = useRef('')

  // useEffect(() => {
  //   if (!open) return
  //   getCategoriesByUserAction(calculationType === 'income' ? 'income' : 'expense').then(res => {
  //     if (res.success && res.data) {
  //       setCategories(current => {
  //         const fetched = res.data as CategorySelect[]
  //         return [
  //           ...fetched,
  //           ...current.filter(category => !fetched.some(item => item.id === category.id)),
  //         ]
  //       })
  //     }
  //   })
  // }, [open, calculationType])

  const createCategory = async () => {
    const categoryName = name.trim()
    if (!categoryName) {
      toast.error('Enter an item name before creating its category')
      return
    }
    const result = await createCategoryAction({
      name: categoryName,
      type: calculationType === 'income' ? 'income' : 'expense',
      icon: 'more_horizontal',
      color: '94a3b8',
    })
    if (result.success && result.data) {
      const category = result.data as CategorySelect
      setCategories(current => [...current, category])
      setCategoryId(category.id)
      selectedCategoryIdRef.current = category.id
      toast.success('Category created and selected')
    } else {
      toast.error(result.message ?? 'Failed to create category')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amount = parseFloat(plannedAmount)
    if (!name.trim() || isNaN(amount) || amount < 0) {
      toast.error('Enter a valid name and amount')
      return
    }

    startTransition(async () => {
      const result = await createBudgetItemAction(
        {
          groupId,
          name: name.trim(),
          plannedAmount: amount,
          categoryId: categoryId || selectedCategoryIdRef.current || null,
        },
        budgetId,
      )
      if (result.success) {
        toast.success(result.message ?? 'Item added')
        setName('')
        setPlannedAmount('')
        setCategoryId('')
        selectedCategoryIdRef.current = ''
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
          <Label
            htmlFor='item-name'
            className='text-[10px] uppercase tracking-wider text-muted-foreground'
          >
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
          <Label
            htmlFor='item-amount'
            className='text-[10px] uppercase tracking-wider text-muted-foreground'
          >
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
          <Label
            htmlFor='item-category'
            className='text-[10px] uppercase tracking-wider text-muted-foreground'
          >
            Category
          </Label>
          <Select
            value={categoryId}
            onValueChange={value => {
              setCategoryId(value)
              selectedCategoryIdRef.current = value
            }}
          >
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
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='h-6 px-0 text-[10px]'
            onClick={createCategory}
            disabled={isPending}
          >
            <Plus className='mr-1 size-3' /> Create category from item name
          </Button>
        </div>
      </div>

      <div className='flex items-center justify-end gap-1.5'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-7 text-xs'
          onClick={() => setOpen(false)}
        >
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
