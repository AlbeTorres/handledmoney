'use client'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { PasswordConfirmDialog, useConfirmAction } from '@/hooks/use-confirm-password'

import { authClient } from '@/lib/auth-client'
import { UpdatePersonalInfoSchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { LucideUserPen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

type FormValues = z.infer<typeof UpdatePersonalInfoSchema>

type PersonalInfomationSettingsProps = {
  user: {
    id: string
    name: string
    email: string
  }
}

export default function PersonalInfomationSettings({ user }: PersonalInfomationSettingsProps) {
  const router = useRouter()

  const { confirm, dialogProps } = useConfirmAction({
    title: 'Change Email',
    description: 'Are you sure you want to change your email? This action cannot be undone.',
    onSubmit: password =>
      authClient.twoFactor.enable({ password }).then(r => {
        if (r.error) throw new Error(r.error.message ?? 'Failed to verify password')
        return r.data
      }),
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(UpdatePersonalInfoSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
    },
  })

  const handleEdit = () => setIsEditing(true)

  const handleCancel = () => {
    form.reset({ name: user?.name ?? '', email: user?.email ?? '' })
    setIsEditing(false)
  }

  const handleSubmit = async (values: FormValues) => {
    setIsPending(true)

    const emailChanged = values.email !== user?.email

    // Update name (and any other non-email fields) via updateUser
    const { error: updateError } = await authClient.updateUser({
      name: values.name,
    })

    if (updateError) {
      setIsPending(false)
      toast.error('Failed to update profile. Please try again.')
      return
    }

    // Email changes go through changeEmail, which triggers verification
    if (emailChanged) {
      const ok = await confirm()
      if (!ok) {
        setIsPending(false)
        return
      }
      const { error: emailError } = await authClient.changeEmail({
        newEmail: values.email,
        callbackURL: '/settings', // wherever you want the user redirected after verifying
      })

      setIsPending(false)

      if (emailError) {
        toast.error('Failed to update email. Please try again.')
        return
      }

      toast.success(
        'A verification email has been sent to your new address. Changes will apply after verification.',
      )
      setIsEditing(false)
      router.refresh()
      return
    }

    setIsPending(false)
    toast.success('Profile updated successfully.')
    setIsEditing(false)
    router.refresh()
  }
  return (
    <div className='bg-white shadow-sm p-6 rounded-xl flex flex-col gap-2'>
      <PasswordConfirmDialog {...dialogProps} />
      <div className='flex justify-between items-center mb-5'>
        <div className='flex items-center gap-2'>
          <LucideUserPen size={20} />
          <h3 className='font-bold text-foreground'>Personal Information</h3>
        </div>
        {!isEditing && (
          <Button
            id='edit-personal'
            variant='link'
            size='sm'
            className='text-secondary font-label-caps px-0 h-auto'
            onClick={handleEdit}
          >
            EDIT
          </Button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FieldGroup>
          {/* Full Name */}
          <Controller
            name='name'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor='personal-name'
                  className='font-label-caps text-on-surface-variant'
                >
                  FULL NAME
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id='personal-name'
                    aria-label='Full Name'
                    aria-invalid={fieldState.invalid}
                    readOnly={!isEditing}
                    disabled={isPending}
                    placeholder='Your full name'
                    autoComplete='name'
                  />
                </InputGroup>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Email Address */}
          <Controller
            name='email'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor='personal-email'
                  className='font-label-caps text-on-surface-variant'
                >
                  EMAIL ADDRESS
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id='personal-email'
                    aria-label='Email Address'
                    aria-invalid={fieldState.invalid}
                    type='email'
                    readOnly={!isEditing}
                    disabled={isPending}
                    placeholder='your@email.com'
                    autoComplete='email'
                  />
                </InputGroup>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Phone Number — read-only, future feature */}
          <Field>
            <FieldLabel
              htmlFor='personal-phone'
              className='font-label-caps text-on-surface-variant'
            >
              PHONE NUMBER
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id='personal-phone'
                aria-label='Phone Number'
                type='tel'
                readOnly
                disabled
                placeholder='Coming soon'
                value=''
              />
            </InputGroup>
          </Field>
        </FieldGroup>

        {/* Actions */}
        {isEditing && (
          <div className='flex justify-end gap-3 mt-6'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={isPending}
              onClick={handleCancel}
            >
              CANCEL
            </Button>
            <Button type='submit' size='sm' disabled={isPending}>
              {isPending ? 'Saving...' : 'SAVE CHANGES'}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
