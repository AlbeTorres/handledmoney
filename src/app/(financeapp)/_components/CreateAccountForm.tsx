'use client'

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { CreateAccountSchema } from '@/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { DollarSign } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { AppearanceSection } from './AppearanceSection'
import { FormActions } from './FormActions'

type CreateAccountValues = z.infer<typeof CreateAccountSchema>

const ACCOUNT_TYPES = [
  { value: 'savings', label: 'Savings Account' },
  { value: 'checking', label: 'Checking Account' },
  { value: 'investment', label: 'Investment' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'cash', label: 'Cash / Wallet' },
] as const

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
] as const

export function CreateAccountForm() {
  const [isPending, setIsPending] = useState(false)

  const form = useForm<CreateAccountValues>({
    resolver: zodResolver(CreateAccountSchema),
    defaultValues: {
      name: '',
      bank: '',
      type: 'savings',
      currency: 'USD',
      balance: 0,
      icon: 'account_balance',
      color: '137FEC',
    },
  })

  const handleSubmit = async (data: CreateAccountValues) => {
    setIsPending(true)
    try {
      // TODO: call server action
      console.log('Create account:', data)
    } finally {
      setIsPending(false)
    }
  }

  const handleCancel = useCallback(() => {
    form.reset()
    // TODO: navigate back
  }, [form])

  return (
    <div className='bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden'>
      <form id='form-create-account' onSubmit={form.handleSubmit(handleSubmit)}>
        <div className='p-8 space-y-8'>
          {/* Basic Info */}
          <FieldGroup>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <Controller
                name='name'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-create-account-name'>Account Name</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id='form-create-account-name'
                        aria-invalid={fieldState.invalid}
                        placeholder='e.g., Main Savings'
                        autoComplete='off'
                        spellCheck={false}
                        disabled={isPending}
                      />
                    </InputGroup>
                    <FieldDescription>Must be a unique name for your records.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name='bank'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-create-account-bank'>Bank Name</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id='form-create-account-bank'
                        aria-invalid={fieldState.invalid}
                        placeholder='e.g., Chase Bank'
                        autoComplete='organization'
                        disabled={isPending}
                      />
                    </InputGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <Controller
                name='type'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-create-account-type'>Account Type</FieldLabel>
                    <div className='relative'>
                      <select
                        {...field}
                        id='form-create-account-type'
                        aria-invalid={fieldState.invalid}
                        disabled={isPending}
                        className='w-full appearance-none bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-slate-900 dark:text-white'
                      >
                        {ACCOUNT_TYPES.map(t => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <span
                        aria-hidden='true'
                        className='material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400'
                      >
                        expand_more
                      </span>
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name='currency'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-create-account-currency'>Currency</FieldLabel>
                    <div className='relative'>
                      <span
                        aria-hidden='true'
                        className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm'
                      >
                        public
                      </span>
                      <select
                        {...field}
                        id='form-create-account-currency'
                        aria-invalid={fieldState.invalid}
                        disabled={isPending}
                        className='w-full appearance-none bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-slate-900 dark:text-white'
                      >
                        {CURRENCIES.map(c => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <span
                        aria-hidden='true'
                        className='material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400'
                      >
                        expand_more
                      </span>
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              name='balance'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='form-create-account-balance'>Initial Balance</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align='inline-start'>
                      <DollarSign aria-hidden='true' className='size-4' />
                    </InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      id='form-create-account-balance'
                      aria-invalid={fieldState.invalid}
                      type='number'
                      inputMode='decimal'
                      step='0.01'
                      min='0'
                      disabled={isPending}
                      className='text-2xl font-bold tabular-nums py-4'
                    />
                  </InputGroup>
                  <FieldDescription>
                    The current balance of this account as of today.
                  </FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <div className='border-t border-slate-100 dark:border-slate-800' />

          {/* Appearance */}
          <AppearanceSection
            iconValue={form.watch('icon')}
            colorValue={form.watch('color')}
            onIconChange={icon => form.setValue('icon', icon, { shouldValidate: true })}
            onColorChange={color => form.setValue('color', color, { shouldValidate: true })}
            iconError={form.formState.errors.icon}
            colorError={form.formState.errors.color}
          />
        </div>

        <FormActions onCancel={handleCancel} isPending={isPending} />
      </form>
    </div>
  )
}
