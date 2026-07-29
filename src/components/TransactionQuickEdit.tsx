'use client'

import { UpdateTransactionSchema } from '@/lib/schema'
import { updateTransactionAction } from '@/actions/transaction/update-transaction'
import { Account, Category, Transaction } from '@/interfaces'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import z from 'zod'
import { useTranslations } from 'next-intl'
import { Tab } from './Tab'
import { Button } from './ui/button'
import { Calendar } from './ui/calendar'
import { Field, FieldError, FieldLabel } from './ui/field'
import { InputGroup, InputGroupInput } from './ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet'
import { Textarea } from './ui/textarea'

type UpdateTransactionValues = z.infer<typeof UpdateTransactionSchema>

export const TransactionQuickEdit = ({
  accounts,
  categories,
  isOpen,
  transaction,
  onClose,
}: {
  accounts: Account[]
  categories: Category[]
  isOpen: boolean
  transaction: Transaction | null
  onClose: () => void
}) => {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const t = useTranslations('handledmoney.transaction')

  const form = useForm<UpdateTransactionValues>({
    resolver: zodResolver(UpdateTransactionSchema),
    defaultValues: transaction
      ? {
          id: transaction.id,
          date: new Date(transaction.date),
          accountId: transaction.accountId,
          categoryId: transaction.categoryId ?? undefined,
          payee: transaction.payee,
          amount: Number(transaction.amount || 0),
          notes: transaction.notes ?? undefined,
          type: transaction.type,
        }
      : undefined,
  })

  // Reset form when transaction changes
  if (transaction) {
    const current = form.getValues()
    if (current.id !== transaction.id) {
      form.reset({
        id: transaction.id,
        date: new Date(transaction.date),
        accountId: transaction.accountId,
        categoryId: transaction.categoryId ?? undefined,
        payee: transaction.payee,
        amount: Number(transaction.amount || 0),
        notes: transaction.notes ?? undefined,
        type: transaction.type,
      })
    }
  }

  const handleSubmit = async (data: UpdateTransactionValues) => {
    setIsPending(true)
    try {
      const res = await updateTransactionAction(data)

      if (res.success) {
        toast.success(t('form.update_success'))
        onClose()
        router.refresh()
      } else {
        toast.error(t('form.update_error'))
      }
    } catch {
      toast.error(t('form.update_error'))
    } finally {
      setIsPending(false)
    }
  }

  if (!isOpen || !transaction) return null

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side='right'>
        <SheetHeader>
          <SheetTitle>{t('form.quick_edit')}</SheetTitle>
        </SheetHeader>
        <form id='form-quick-edit-transaction' onSubmit={form.handleSubmit(handleSubmit)}>
          <div className='space-y-4 p-4 overflow-y-auto flex-1'>
            <Controller
              name='type'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t('form.transaction_type')}</FieldLabel>
                  <Tab
                    activeView={field.value}
                    onViewChange={field.onChange}
                    tabs={['income', 'expense']}
                    labels={{ income: t('form.type_income'), expense: t('form.type_expense') }}
                  />
                </Field>
              )}
            />

            <Controller
              name='date'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t('form.date')}</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className='data-[empty=true]:text-muted-foreground w-full justify-between text-left font-normal'
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
                  <FieldLabel htmlFor='form-quick-edit-amount'>{t('form.amount')}</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id='form-quick-edit-amount'
                      aria-invalid={fieldState.invalid}
                      placeholder={t('form.amount_placeholder')}
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
                  <FieldLabel htmlFor='form-quick-edit-payee'>{t('form.payee')}</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id='form-quick-edit-payee'
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

            <Controller
              name='accountId'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t('form.account')}</FieldLabel>
                  <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      aria-invalid={fieldState.invalid}
                      className='w-full'
                    >
                      <SelectValue placeholder={t('form.account_placeholder')} />
                    </SelectTrigger>
                    <SelectContent position='item-aligned'>
                      {accounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name}
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
                  <FieldLabel>{t('form.category')}</FieldLabel>
                  <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      aria-invalid={fieldState.invalid}
                      className='w-full'
                    >
                      <SelectValue placeholder={t('form.category_placeholder')} />
                    </SelectTrigger>
                    <SelectContent position='item-aligned'>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name='notes'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='form-quick-edit-notes'>{t('form.notes')}</FieldLabel>
                  <Textarea
                    {...field}
                    id='form-quick-edit-notes'
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

          <div className='p-4 border-t'>
            <Button type='submit' className='w-full' disabled={isPending} data-testid='form-submit'>
              {isPending ? t('form.updating') : t('form.update_button')}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
