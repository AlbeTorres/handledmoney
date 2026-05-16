'use client'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { authClient } from '@/lib/auth-client'
import { LoginSchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, EyeOffIcon, MailIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { AuthMessage } from './AuthMessage'
import { CardWrapper } from './CardWrapper'

export const LoginForm = () => {
  const router = useRouter()
  const t = useTranslations('handledmoney.auth')
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startLoading] = useState(false)
  const [message, setMessage] = useState<{ message: string; type: 'error' | 'success' | null }>({
    message: '',
    type: null,
  })
  const [showTwoFactor, setShowTwoFactor] = useState(false)

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      code: '',
    },
  })

  const handleSubmit = async (data: z.infer<typeof LoginSchema>) => {
    startLoading(true)
    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: '/dashboard',
      },
      {
        onSuccess: () => {
          startLoading(false)
        },
        onError: async ctx => {
          startLoading(false)
          if (ctx.error.status === 403) {
            // Reenviar email de verificación manualmente
            await authClient.sendVerificationEmail({
              email: data.email,
              callbackURL: '/auth/new-verification?redirect=false',
            })
            setMessage({
              message: 'Debes verificar tu email. Te hemos reenviado el correo de verificación.',
              type: 'error',
            })
          } else {
            setMessage({ message: ctx.error.message, type: 'error' })
          }
        },
      },
    )
  }

  return (
    <CardWrapper
      isPending={isPending}
      headerLabel={t('signin_title')}
      backButtonHref='/auth/new-account'
      backButtonLabel={t('signup_link')}
      recoverButtonHref='/auth/reset'
      recoverButtonLabel={t('password_recovery')}
      callbackUrl={'/'}
      showSocial
    >
      <form id='form-signin' onSubmit={form.handleSubmit(handleSubmit)}>
        <FieldGroup>
          <Controller
            name='email'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='form-signin-email'>{t('email')}</FieldLabel>
                <InputGroup className='w-full border rounded-md  focus:outline-none focus:ring-1! focus:ring-blue-600!'>
                  <InputGroupInput
                    {...field}
                    id='form-signin-email'
                    aria-invalid={fieldState.invalid}
                    placeholder={t('email_placeholder')}
                    autoComplete='off'
                    type='email'
                    disabled={isPending}
                  />
                  <InputGroupAddon>
                    <MailIcon />
                  </InputGroupAddon>
                </InputGroup>

                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
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
        <AuthMessage className='my-4' type={message.type} message={message.message} />
        <Button
          disabled={isPending}
          type='submit'
          className='block! px-6 py-2 mt-8 w-full text-white rounded-lg hover:bg-secondary transition-all duration-300'
        >
          {showTwoFactor ? t('confirm') : t('signin')}
        </Button>
      </form>
    </CardWrapper>
  )
}
