'use client'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { authClient } from '@/lib/auth-client'
import { SettingsPasswordSchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, EyeOffIcon, LucideLock } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

type FormValues = z.infer<typeof SettingsPasswordSchema>

export default function UpdatePasswordSettings() {
  const [isPending, setIsPending] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(SettingsPasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  const handleSubmit = async (values: FormValues) => {
    setIsPending(true)

    const { error } = await authClient.changePassword({
      newPassword: values.newPassword,
      currentPassword: values.currentPassword,
      revokeOtherSessions: true,
    })

    setIsPending(false)

    if (error) {
      toast.error(error.message || 'Incorrect current password. Please try again.')
      return
    }

    toast.success('Password updated successfully.')
    form.reset()
    setShowCurrent(false)
    setShowNew(false)
    setShowConfirm(false)
  }

  return (
    <div className='bg-white shadow-sm p-6 rounded-xl flex flex-col gap-2'>
      <div className='flex items-center gap-2 mb-5'>
        <LucideLock size={20} />
        <h3 className='font-bold text-foreground'>Security Settings</h3>
      </div>
      
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FieldGroup>
          {/* Current Password */}
          <Controller
            name='currentPassword'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='current-password' className='font-label-caps text-on-surface-variant'>
                  CURRENT PASSWORD
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id='current-password'
                    aria-label='Current Password'
                    aria-invalid={fieldState.invalid}
                    type={showCurrent ? 'text' : 'password'}
                    disabled={isPending}
                    placeholder='••••••••••••'
                    autoComplete='current-password'
                  />
                  <InputGroupAddon align='inline-end'>
                    <button
                      type='button'
                      data-testid='toggle-current-password'
                      onClick={() => setShowCurrent((prev) => !prev)}
                      disabled={isPending}
                      className='text-muted-foreground hover:text-foreground pl-1.5 transition-colors'
                      aria-label={showCurrent ? 'Hide password' : 'Show password'}
                    >
                      {showCurrent ? <EyeIcon className='size-4' /> : <EyeOffIcon className='size-4' />}
                    </button>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* New Password */}
          <Controller
            name='newPassword'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='new-password' className='font-label-caps text-on-surface-variant'>
                  NEW PASSWORD
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id='new-password'
                    aria-label='New Password'
                    aria-invalid={fieldState.invalid}
                    type={showNew ? 'text' : 'password'}
                    disabled={isPending}
                    autoComplete='new-password'
                  />
                  <InputGroupAddon align='inline-end'>
                    <button
                      type='button'
                      data-testid='toggle-new-password'
                      onClick={() => setShowNew((prev) => !prev)}
                      disabled={isPending}
                      className='text-muted-foreground hover:text-foreground pl-1.5 transition-colors'
                      aria-label={showNew ? 'Hide password' : 'Show password'}
                    >
                      {showNew ? <EyeIcon className='size-4' /> : <EyeOffIcon className='size-4' />}
                    </button>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Confirm New Password */}
          <Controller
            name='confirmNewPassword'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='confirm-password' className='font-label-caps text-on-surface-variant'>
                  CONFIRM NEW PASSWORD
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id='confirm-password'
                    aria-label='Confirm New Password'
                    aria-invalid={fieldState.invalid}
                    type={showConfirm ? 'text' : 'password'}
                    disabled={isPending}
                    autoComplete='new-password'
                  />
                  <InputGroupAddon align='inline-end'>
                    <button
                      type='button'
                      data-testid='toggle-confirm-password'
                      onClick={() => setShowConfirm((prev) => !prev)}
                      disabled={isPending}
                      className='text-muted-foreground hover:text-foreground pl-1.5 transition-colors'
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <EyeIcon className='size-4' /> : <EyeOffIcon className='size-4' />}
                    </button>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>

        <div className='pt-6'>
          <Button
            type='submit'
            disabled={isPending}
            className='w-full py-3 bg-primary text-white rounded-lg font-label-caps hover:bg-primary/90 transition-all flex items-center justify-center gap-2'
          >
            <span className='material-symbols-outlined text-[18px]' data-icon='key'>
              key
            </span>
            {isPending ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </form>
    </div>
  )
}
