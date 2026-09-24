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
import toast from 'react-hot-toast'
import { z } from 'zod'
import { Checkbox } from './ui/checkbox'

export const LoginForm = () => {
  const router = useRouter()
  const t = useTranslations('handledmoney.auth')
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startLoading] = useState(false)

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const handleSubmit = async (data: z.infer<typeof LoginSchema>) => {
    startLoading(true)

    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: '/dashboard',
        rememberMe: data.rememberMe,
      },
      {
        onSuccess: ({ data }) => {
          startLoading(false)
          if (data?.twoFactorRedirect) {
            router.push('/auth/two-factor')
            toast.success('Please enter your 2FA code')
          }
        },
        onError: async ctx => {
          startLoading(false)
          if (ctx.error.status === 403) {
            router.push('/auth/new-verification?email=' + data.email)
          } else {
            toast.error(t('error.invalid_credentials'))
          }
        },
      },
    )
  }

  return (
    <>
      <form id='form-signin' onSubmit={form.handleSubmit(handleSubmit)}>
        <FieldGroup>
          <Controller
            name='email'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='form-signin-email'>{t('email')}</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id='form-signin-email'
                    aria-invalid={fieldState.invalid}
                    placeholder={t('email_placeholder')}
                    autoComplete='email'
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
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id='form-signin-password'
                    aria-invalid={fieldState.invalid}
                    placeholder={t('password_placeholder')}
                    autoComplete='current-password'
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
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name='rememberMe'
            control={form.control}
            render={({ field }) => (
              <div className='flex items-center gap-2 mt-1'>
                <Checkbox
                  id='form-signin-remember'
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                />
                <label
                  htmlFor='form-signin-remember'
                  className='text-sm text-muted-foreground cursor-pointer select-none'
                >
                  {t('remember_me')}
                </label>
              </div>
            )}
          />
        </FieldGroup>

        <Button disabled={isPending} type='submit' className='mt-8 w-full'>
          {isPending ? t('signing_in') : t('signin')}
        </Button>
      </form>
    </>
  )
}
