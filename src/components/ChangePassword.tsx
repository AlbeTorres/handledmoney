'use client'

import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { CardWrapper } from './CardWrapper'

import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { authClient } from '@/lib/auth-client'
import { ChangePasswordSchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as z from 'zod'

export const ChangePassword = () => {
  const t = useTranslations('handledmoney.auth')
  const [isPending, startLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof ChangePasswordSchema>>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      password: '',
    },
  })

  const router = useRouter()
  const token = useSearchParams().get('token')

  const handleSubmit = async (values: z.infer<typeof ChangePasswordSchema>) => {
    startLoading(true)

    if (token === null) {
      startLoading(false)
      toast.error(t('error.missing_token'))
      return
    }

    const { data, error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    })

    if (!data?.status) {
      startLoading(false)
      if (error?.message === 'expired_token') {
        toast.error(t('error.invalid_token'))
        return
      }
      toast.error(t('error.unknown_error'))
    } else {
      startLoading(false)
      toast.success(t('success.password_reset'))
      router.push('/auth/login')
    }
  }

  return (
    <CardWrapper
      headerLabel={t('forgot_password_title')}
      backButtonHref='/auth/login'
      backButtonLabel={t('back_to_login')}
    >
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className='mt-4 space-y-4'>
          <FieldGroup>
            <Controller
              name='password'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='form-signin-password'>{t('password')}</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id='form-signin-password'
                      aria-invalid={fieldState.invalid}
                      placeholder={t('password_placeholder')}
                      autoComplete='new-password'
                      type={showPassword ? 'text' : 'password'}
                      disabled={isPending}
                    />
                    <InputGroupAddon>
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isPending}
                        className='pl-1.5 text-muted-foreground hover:text-foreground'
                        aria-label={showPassword ? t('hide_password') : t('show_password')}
                      >
                        {showPassword ? (
                          <EyeIcon className='w-4 h-4' />
                        ) : (
                          <EyeOffIcon className='w-4 h-4' />
                        )}
                      </button>
                    </InputGroupAddon>
                  </InputGroup>

                  {fieldState.invalid && (
                    <FieldError errors={[{ message: t('error.password_no_secure') }]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </div>

        <Button disabled={isPending} type='submit' className='mt-8 w-full'>
          {t('reset_password')}
        </Button>
      </form>
    </CardWrapper>
  )
}
