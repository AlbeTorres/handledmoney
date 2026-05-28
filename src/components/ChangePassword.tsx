'use client'

import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { CardWrapper } from './CardWrapper'

import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { authClient } from '@/lib/auth-client'
import { ChangePasswordSchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as z from 'zod'

const requirements = [
  { label: 'Minimum 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'At least one uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'At least one number', test: (v: string) => /[0-9]/.test(v) },
  { label: 'At least one special character', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
]

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

  const passwordValue = form.watch('password')
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
      router.push('/')
    }
  }

  return (
    <CardWrapper
      headerLabel={t('forgot_password_title')}
      backButtonHref='/auth/login'
      backButtonLabel={t('back_to_login')}
      callbackUrl={'/'}
      isPending={isPending}
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
                  <InputGroup className='focus:outline-none focus:ring-1 focus:ring-blue-600'>
                    <InputGroupInput
                      {...field}
                      id='form-signin-password'
                      aria-invalid={fieldState.invalid}
                      placeholder={t('password_placeholder')}
                      autoComplete='off'
                      type={showPassword ? 'text' : 'password'}
                      disabled={isPending}
                    />
                    <InputGroupAddon>
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isPending}
                        className='text-gray-500 pl-1.5 hover:text-foreground/80'
                      >
                        {showPassword ? (
                          <EyeIcon className='w-4 h-4' />
                        ) : (
                          <EyeOffIcon className='w-4 h-4' />
                        )}
                      </button>
                    </InputGroupAddon>
                  </InputGroup>

                  {passwordValue.length > 0 && (
                    <ul className='mt-2 space-y-1'>
                      {requirements.map(req => {
                        const met = req.test(passwordValue)
                        return (
                          <li
                            key={req.label}
                            className={`flex items-center gap-1.5 text-xs ${
                              met ? 'text-green-500' : 'text-muted-foreground'
                            }`}
                          >
                            {met ? (
                              <CheckIcon className='w-3 h-3 shrink-0' />
                            ) : (
                              <XIcon className='w-3 h-3 shrink-0' />
                            )}
                            {req.label}
                          </li>
                        )
                      })}
                    </ul>
                  )}

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </div>

        <Button
          disabled={isPending}
          type='submit'
          className='block! px-6 py-2 mt-8 w-full text-white rounded-lg hover:bg-secondary transition-all duration-300'
        >
          {t('reset_password')}
        </Button>
      </form>
    </CardWrapper>
  )
}
