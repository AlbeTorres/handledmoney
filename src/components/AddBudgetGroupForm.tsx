'use client'

import { createBudgetGroupAction } from '@/actions/budget/budget-item'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

export function AddBudgetGroupForm({ budgetId, nextSortOrder }: { budgetId: string; nextSortOrder: number }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [calculationType, setCalculationType] = useState<'income' | 'outflow'>('outflow')
  const [pending, startTransition] = useTransition()

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    startTransition(async () => {
      const result = await createBudgetGroupAction({ budgetId, name: name.trim(), calculationType, sortOrder: nextSortOrder }, budgetId)
      if (result.success) { setName(''); setOpen(false); toast.success(result.message ?? 'Group added') }
      else toast.error(result.message ?? 'Failed to add group')
    })
  }

  if (!open) return <Button variant='outline' size='sm' className='gap-2' onClick={() => setOpen(true)}><Plus className='size-4' /> Add group</Button>
  return (
    <form onSubmit={submit} className='rounded-xl border border-border bg-card p-4 space-y-3'>
      <div className='grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end'>
        <div className='space-y-1'><Label htmlFor='budget-group-name'>Group name</Label><Input id='budget-group-name' value={name} onChange={event => setName(event.target.value)} required autoFocus /></div>
        <div className='space-y-1'><Label>Calculation type</Label><Select value={calculationType} onValueChange={value => setCalculationType(value as 'income' | 'outflow')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value='income'>Income</SelectItem><SelectItem value='outflow'>Outflow</SelectItem></SelectContent></Select></div>
        <div className='flex gap-2'><Button type='button' variant='ghost' onClick={() => setOpen(false)}>Cancel</Button><Button type='submit' disabled={pending}>Add group</Button></div>
      </div>
    </form>
  )
}
