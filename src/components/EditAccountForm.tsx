'use client'

import { editBankAccount } from '@/actions/account/update-account'
import { AppearanceSection } from '@/components/AppearanceSection'
import { FormActions } from '@/components/FormActions'
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
import { UpdateAccountSchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

type EditAccountValues = z.infer<typeof UpdateAccountSchema>

export function EditAccountForm({ initialValues }: { initialValues: EditAccountValues }) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const form = useForm<EditAccountValues>({
    resolver: zodResolver(UpdateAccountSchema),
    defaultValues: initialValues,
  })

  const handleSubmit = async (data: EditAccountValues) => {
    setIsPending(true)
    try {
      const res = await editBankAccount(data)

      if (res.success) {
        toast.success(res.message)
        router.push('/account')
        router.refresh()
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong')
    } finally {
      setIsPending(false)
    }
  }

  const handleCancel = useCallback(() => {
    router.back()
  }, [router])

  return (
    <div className='bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden'>
      <form id='form-edit-account' onSubmit={form.handleSubmit(handleSubmit)}>
        <div className='p-8 space-y-8'>
          <FieldGroup>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <Controller
                name='name'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-edit-account-name'>Account Name</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id='form-edit-account-name'
                        aria-invalid={fieldState.invalid}
                        placeholder='e.g., Main Savings'
                        autoComplete='off'
                        disabled={isPending}
                      />
                    </InputGroup>
                    <FieldDescription>Update the name for your records.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name='bank'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-edit-account-bank'>Bank Name</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id='form-edit-account-bank'
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
                    <FieldLabel htmlFor='form-edit-account-type'>Account Type</FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id='form-edit-account-type'
                        aria-invalid={fieldState.invalid}
                        className='w-full'
                      >
                        <SelectValue placeholder='Select' />
                      </SelectTrigger>
                      <SelectContent position='item-aligned'>
                        {ACCOUNT_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
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
                    <FieldLabel htmlFor='form-edit-account-currency'>Currency</FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id='form-edit-account-currency'
                        aria-invalid={fieldState.invalid}
                        className='w-full'
                      >
                        <SelectValue placeholder='Select' />
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
          text='Update Account'
          loadingText='Updating…'
        />
      </form>
    </div>
  )
}
