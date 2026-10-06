'use client'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { authClient } from '@/lib/auth-client'
import { SettingsPasswordSchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, EyeOffIcon, KeyIcon, LucideLock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

type FormValues = z.infer<typeof SettingsPasswordSchema>

export default function UpdatePasswordSettings() {
  const t = useTranslations('handledmoney.settings.update_password')
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
      toast.error(error.message || t('toast.incorrect_password'))
      return
    }

    toast.success(t('toast.password_updated'))
    form.reset()
    setShowCurrent(false)
    setShowNew(false)
    setShowConfirm(false)
  }

  return (
    <div className='bg-white shadow-sm p-6 rounded-xl flex flex-col gap-2'>
      <div className='flex items-center gap-2 mb-5'>
        <LucideLock size={20} />
        <h3 className='font-bold text-foreground'>{t('heading')}</h3>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FieldGroup>
          {/* Current Password */}
          <Controller
            name='currentPassword'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor='current-password'
                  className='font-label-caps text-on-surface-variant'
                >
                  {t('current_password_label')}
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id='current-password'
                    aria-label={t('current_password_label')}
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
                      onClick={() => setShowCurrent(prev => !prev)}
                      disabled={isPending}
                      className='text-muted-foreground hover:text-foreground pl-1.5 transition-colors'
                      aria-label={showCurrent ? t('hide_password') : t('show_password')}
                    >
                      {showCurrent ? (
                        <EyeIcon className='size-4' />
                      ) : (
                        <EyeOffIcon className='size-4' />
                      )}
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
                <FieldLabel
                  htmlFor='new-password'
                  className='font-label-caps text-on-surface-variant'
                >
                  {t('new_password_label')}
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id='new-password'
                    aria-label={t('new_password_label')}
                    aria-invalid={fieldState.invalid}
                    type={showNew ? 'text' : 'password'}
                    disabled={isPending}
                    autoComplete='new-password'
                  />
                  <InputGroupAddon align='inline-end'>
                    <button
                      type='button'
                      data-testid='toggle-new-password'
                      onClick={() => setShowNew(prev => !prev)}
                      disabled={isPending}
                      className='text-muted-foreground hover:text-foreground pl-1.5 transition-colors'
                      aria-label={showNew ? t('hide_password') : t('show_password')}
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
                <FieldLabel
                  htmlFor='confirm-password'
                  className='font-label-caps text-on-surface-variant'
                >
                  {t('confirm_password_label')}
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id='confirm-password'
                    aria-label={t('confirm_password_label')}
                    aria-invalid={fieldState.invalid}
                    type={showConfirm ? 'text' : 'password'}
                    disabled={isPending}
                    autoComplete='new-password'
                  />
                  <InputGroupAddon align='inline-end'>
                    <button
                      type='button'
                      data-testid='toggle-confirm-password'
                      onClick={() => setShowConfirm(prev => !prev)}
                      disabled={isPending}
                      className='text-muted-foreground hover:text-foreground pl-1.5 transition-colors'
                      aria-label={showConfirm ? t('hide_password') : t('show_password')}
                    >
                      {showConfirm ? (
                        <EyeIcon className='size-4' />
                      ) : (
                        <EyeOffIcon className='size-4' />
                      )}
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
            <KeyIcon className='size-4' />
            {isPending ? t('updating') : t('update_button')}
          </Button>
        </div>
      </form>
    </div>
  )
}
