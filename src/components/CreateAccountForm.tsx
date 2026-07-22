'use client'
import { newBankAccount } from '@/actions/account/create-account'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ACCOUNT_TYPES, CURRENCIES } from '@/lib/data'
import { CreateAccountSchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { AppearanceSection } from './AppearanceSection'
import { FormActions } from './FormActions'

type CreateAccountValues = z.infer<typeof CreateAccountSchema>

export function CreateAccountForm() {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const t = useTranslations('handledmoney.account')

  const form = useForm<CreateAccountValues>({
    resolver: zodResolver(CreateAccountSchema),
    defaultValues: {
      name: '',
      bank: '',
      type: 'savings',
      currency: 'USD',

      icon: 'account_balance',
      color: '137FEC',
    },
  })

  const handleSubmit = async (data: CreateAccountValues) => {
    setIsPending(true)
    const { name, bank, type, currency, icon, color } = data
    try {
      const res = await newBankAccount({ name, bank, type, currency, icon, color })

      if (res.success) {
        toast.success(res.message)
        form.reset()
      }
    } catch (error) {
      console.log(error, 'error')
      toast.error(t('form.error_generic'))
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
                    <FieldLabel htmlFor='form-create-account-name'>{t('form.account_name')}</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id='form-create-account-name'
                        aria-invalid={fieldState.invalid}
                        placeholder={t('form.account_name_placeholder')}
                        autoComplete='off'
                        spellCheck={false}
                        disabled={isPending}
                      />
                    </InputGroup>
                    <FieldDescription>{t('form.account_name_description')}</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name='bank'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-create-account-bank'>{t('form.bank_name')}</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id='form-create-account-bank'
                        aria-invalid={fieldState.invalid}
                        placeholder={t('form.bank_name_placeholder')}
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
                    <FieldLabel htmlFor='form-create-account-type'>{t('form.account_type')}</FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id='form-create-account-type'
                        aria-invalid={fieldState.invalid}
                        className='w-full'
                      >
                        <SelectValue placeholder={t('form.select_placeholder')} />
                      </SelectTrigger>
                      <SelectContent position='item-aligned'>
                        {ACCOUNT_TYPES.map(accountType => (
                          <SelectItem key={accountType.value} value={accountType.value}>
                            {accountType.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name='currency'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-create-account-currency'>{t('form.currency')}</FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id='form-create-account-currency'
                        aria-invalid={fieldState.invalid}
                        className='w-full'
                      >
                        <SelectValue placeholder={t('form.select_placeholder')} />
                      </SelectTrigger>
                      <SelectContent position='item-aligned'>
                        {CURRENCIES.map(c => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>

          <div className='border-t border-slate-100 dark:border-slate-800' />

          <AppearanceSection
            iconValue={form.watch('icon')}
            colorValue={form.watch('color')}
            onIconChange={icon => form.setValue('icon', icon, { shouldValidate: true })}
            onColorChange={color => form.setValue('color', color, { shouldValidate: true })}
            iconError={form.formState.errors.icon}
            colorError={form.formState.errors.color}
          />
        </div>

        <FormActions
          onCancel={handleCancel}
          isPending={isPending}
          text={t('form.create_button')}
          loadingText={t('form.creating')}
        />
      </form>
    </div>
  )
}
