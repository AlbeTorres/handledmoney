'use client'
import { createTransactionAction } from '@/actions/transaction/create-transaction'
import { CreateTransactionSchema } from '@/lib/schema'

import { Account, Category } from '@/interfaces'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import z from 'zod'
import { FormActions } from './FormActions'
import { Tab } from './Tab'
import { Button } from './ui/button'
import { Calendar } from './ui/calendar'
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field'
import { InputGroup, InputGroupInput } from './ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'

type CreateTransactionValues = z.infer<typeof CreateTransactionSchema>

export const CreateTransactionForm = ({
  accounts,
  categories,
}: {
  accounts: Account[]
  categories: Category[]
}) => {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const form = useForm<CreateTransactionValues>({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date(),
      payee: '',
      amount: 0,
      notes: '',
    },
  })

  const handleSubmit = async (data: CreateTransactionValues) => {
    setIsPending(true)
    const { date, accountId, categoryId, payee, amount, notes, type } = data
    try {
      const res = await createTransactionAction({
        date,
        accountId,
        categoryId,
        payee,
        amount,
        notes,
        type,
      })

      if (res.success) {
        toast.success(res.message)
        form.reset()
      }
    } catch (error) {
      console.log(error, 'error')
    } finally {
      setIsPending(false)
      router.push('/account')
    }
  }

  const handleCancel = useCallback(() => {
    form.reset()
    router.back()
  }, [form])

  return (
    <form id='form-create-account' onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <div className='bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden'>
          <div className='p-8 space-y-8 '>
            <h1>Transaction Details</h1>

            <div className='grid grid-cols-1 grid-rows-2 sm:grid-cols-2 gap-6'>
              <Controller
                name='type'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-create-transaction-type'>Transaction Type</FieldLabel>

                    <Tab
                      activeView={field.value}
                      onViewChange={field.onChange}
                      tabs={['income', 'expense']}
                    />
                  </Field>
                )}
              />

              <Controller
                name='date'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-create-transaction-date'>Date</FieldLabel>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          id='date-picker-simple'
                          className='data-[empty=true]:text-muted-foreground w-[212px] justify-between text-left font-normal'
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Select a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          defaultMonth={field.value}
                        />
                      </PopoverContent>
                    </Popover>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name='amount'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-create-transaction-amount'>Amount</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id='form-create-transaction-amount'
                        aria-invalid={fieldState.invalid}
                        placeholder='e.g., 100'
                        autoComplete='off'
                        spellCheck={false}
                        disabled={isPending}
                      />
                    </InputGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name='payee'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-create-transaction-payee'>Payee</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id='form-create-transaction-amount'
                        aria-invalid={fieldState.invalid}
                        placeholder='e.g., 100'
                        autoComplete='off'
                        spellCheck={false}
                        disabled={isPending}
                      />
                    </InputGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden'>
          <div className='p-8 space-y-8 '>
            <div className='grid grid-cols-1 grid-rows-2 sm:grid-cols-2 gap-6'>
              <Controller
                name='accountId'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-create-transaction-account'>Account</FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id='form-create-transaction-account'
                        aria-invalid={fieldState.invalid}
                        className='w-full'
                      >
                        <SelectValue placeholder='Select' />
                      </SelectTrigger>
                      <SelectContent position='item-aligned'>
                        {accounts.map(t => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name='categoryId'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-create-transaction-category'>Category</FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id='form-create-transaction-category'
                        aria-invalid={fieldState.invalid}
                        className='w-full'
                      >
                        <SelectValue placeholder='Select' />
                      </SelectTrigger>
                      <SelectContent position='item-aligned'>
                        {categories.map(t => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden'>
          <div className='p-8 space-y-8 '>
            <Controller
              name='notes'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='form-create-transaction-notes'>Note</FieldLabel>
                  <Textarea
                    {...field}
                    id='form-create-transaction-notes'
                    aria-invalid={fieldState.invalid}
                    placeholder='Write a note...'
                    autoComplete='off'
                    spellCheck={false}
                    disabled={isPending}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        </div>
      </FieldGroup>

      <FormActions
        onCancel={handleCancel}
        isPending={isPending}
        text='Create Transaction'
        loadingText='Creating…'
      />
    </form>
  )
}
