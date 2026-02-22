'use client'

import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { CardWrapper } from './CardWrapper'

import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { authClient } from '@/lib/auth-client'
import { ChangePasswordSchema } from '@/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as z from 'zod'
import { AuthMessage } from './AuthMessage'

export const ChangePassword = () => {
  const t = useTranslations('handledmoney.auth')
  const [isPending, startLoading] = useState(false)
  const [message, setMessage] = useState<{ message: string; type: 'error' | 'success' | null }>({
    message: '',
    type: null,
  })
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
    if (token !== null) {
      const { data, error } = await authClient.resetPassword({
        newPassword: values.password,
        token,
      })

      if (!data?.status) {
        // Manejar error

        if (error?.message === 'invalid_credentials') {
          setMessage({
            message: "we couldn't found a registered user with that email",
            type: 'error',
          })
          return
        }
        if (error?.message === 'expired_token') {
          setMessage({
            message: 'Expired token!',
            type: 'error',
          })
          return
        }

        setMessage({
          message: 'Something went wrong!',
          type: 'error',
        })
      } else {
        startLoading(false)
        // Redirigir al usuario
        router.push('/')
        toast.success('Password succefully reseted')
      }
    } else {
      setMessage({
        message: 'Missing token!',
        type: 'error',
      })
    }
  }

  return (
    <CardWrapper
      headerLabel='Forgot your password'
      backButtonHref='/auth/login'
      backButtonLabel='Back to login'
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
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </div>
        <AuthMessage className='my-4' type={message.type} message={message.message} />
        <Button
          disabled={isPending}
          type='submit'
          className='block! px-6 py-2 mt-8 w-full text-white bg-blue-600 rounded-lg hover:bg-blue-900 transition-all duration-300'
        >
          Reset password
        </Button>
      </form>
    </CardWrapper>
  )
}
