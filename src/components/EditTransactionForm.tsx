'use client'
import { UpdateTransactionSchema } from '@/lib/schema'

import { updateTransactionAction } from '@/actions/transaction/update-transaction'
import { Account, Category } from '@/interfaces'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import z from 'zod'
import { FormActions } from './FormActions'
import { Tab } from './Tab'
import { TransactionCategorySelect } from './TransactionCategorySelect'
import { Button } from './ui/button'
import { Calendar } from './ui/calendar'
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field'
import { InputGroup, InputGroupInput } from './ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'

type UpdateTransactionValues = z.infer<typeof UpdateTransactionSchema>

export const EditTransactionForm = ({
  accounts,
  categories,
  initialValues,
}: {
  accounts: Account[]
  categories: Category[]
  initialValues: UpdateTransactionValues
}) => {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const t = useTranslations('handledmoney.transaction')

  const form = useForm<UpdateTransactionValues>({
    resolver: zodResolver(UpdateTransactionSchema),
    defaultValues: initialValues,
  })

  const handleSubmit = async (data: UpdateTransactionValues) => {
    setIsPending(true)
    const { date, accountId, categoryId, payee, amount, notes, type, id } = data
    try {
      const res = await updateTransactionAction({
        date,
        accountId,
        categoryId,
        payee,
        amount,
        notes,
        type,
        id,
      })

      if (res.success) {
        toast.success(res.message)
        form.reset()
        router.push('/transaction')
      } else {
        toast.error(res.message || t('form.error_generic'))
      }
    } catch {
      toast.error(t('form.error_generic'))
    } finally {
      setIsPending(false)
    }
  }

  const handleCancel = useCallback(() => {
    form.reset()
    router.back()
  }, [form, router])

  return (
    <form id='form-edit-transaction' onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <div className='bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden'>
          <div className='p-8 space-y-8 '>
            <div className='grid grid-cols-1 grid-rows-2 sm:grid-cols-2 gap-6'>
              <Controller
                name='type'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-edit-transaction-type'>
                      {t('form.transaction_type')}
                    </FieldLabel>

                    <Tab
                      activeView={field.value}
                      onViewChange={field.onChange}
                      tabs={['income', 'expense']}
                      labels={{ income: t('form.type_income'), expense: t('form.type_expense') }}
                      ariaLabel={t('form.transaction_type')}
                    />
                  </Field>
                )}
              />

              <Controller
                name='date'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-edit-transaction-date'>{t('form.date')}</FieldLabel>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          id='form-edit-transaction-date'
                          className='data-[empty=true]:text-muted-foreground w-[212px] justify-between text-left font-normal'
                        >
                          {field.value ? format(field.value, 'PPP') : t('form.date_placeholder')}
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
                    <FieldLabel htmlFor='form-edit-transaction-amount'>
                      {t('form.amount')}
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id='form-edit-transaction-amount'
                        aria-invalid={fieldState.invalid}
                        placeholder={t('form.amount_placeholder')}
                        autoComplete='off'
                        spellCheck={false}
                        inputMode='decimal'
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
                    <FieldLabel htmlFor='form-edit-transaction-payee'>{t('form.payee')}</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id='form-edit-transaction-payee'
                        aria-invalid={fieldState.invalid}
                        placeholder={t('form.payee_placeholder')}
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
                    <FieldLabel htmlFor='form-edit-transaction-account'>
                      {t('form.account')}
                    </FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id='form-edit-transaction-account'
                        aria-invalid={fieldState.invalid}
                        className='w-full'
                      >
                        <SelectValue placeholder={t('form.select')} />
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
                    <FieldLabel htmlFor='form-edit-transaction-category'>
                      {t('form.category')}
                    </FieldLabel>
                    <TransactionCategorySelect
                      id='form-edit-transaction-category'
                      value={field.value}
                      categories={categories}
                      onValueChange={field.onChange}
                      disabled={isPending}
                      invalid={fieldState.invalid}
                    />
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
                  <FieldLabel htmlFor='form-edit-transaction-notes'>{t('form.notes')}</FieldLabel>
                  <Textarea
                    {...field}
                    id='form-edit-transaction-notes'
                    aria-invalid={fieldState.invalid}
                    placeholder={t('form.notes_placeholder')}
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
        text={t('form.update_button')}
        loadingText={t('form.updating')}
      />
    </form>
  )
}
