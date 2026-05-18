'use client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { RegisterSchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, EyeOffIcon, MailIcon, UserIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import z from 'zod'
import { CardWrapper } from './CardWrapper'

export const RegisterForm = () => {
  const router = useRouter()
  const t = useTranslations('handledmoney.auth')
  const [showPassword, setShowPassword] = useState(false)

  const [isPending, setIsPending] = useState(false)

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  })

  const termsAccepted = form.watch('termsAccepted')

  const handleSubmit = async (data: z.infer<typeof RegisterSchema>) => {
    setIsPending(true)
    const { error } = await authClient.signUp.email({
      role: 'user',
      email: data.email,
      password: data.password,
      name: data.name,
      termsAcceptedAt: new Date(),
      callbackURL: '/auth/new-verification?redirect=false',
    })

    if (error) {
      setIsPending(false)
      toast.error(t('error.unknown_error'), {
        duration: 5000,
      })
    } else {
      setIsPending(false)
      toast.success(t('success.email_sent'), {
        duration: 5000,
      })
      router.replace('/auth/login')
    }
  }

  return (
    <CardWrapper
      headerLabel={t('signup_title')}
      backButtonHref='/auth/login'
      backButtonLabel={t('signin_link')}
      recoverButtonHref='/auth/reset'
      recoverButtonLabel={t('password_recovery')}
      callbackUrl={'/'}
      showSocial
      isPending={isPending}
    >
      <form id='form-signup' onSubmit={form.handleSubmit(handleSubmit)}>
        <FieldGroup>
          <Controller
            name='name'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='form-signup-name'>{t('name')}</FieldLabel>
                <InputGroup className='focus:outline-none focus:ring-1 focus:ring-blue-600'>
                  <InputGroupInput
                    {...field}
                    id='form-signup-name'
                    aria-invalid={fieldState.invalid}
                    placeholder={t('name_placeholder')}
                    autoComplete='off'
                    type='text'
                    disabled={isPending}
                  />
                  <InputGroupAddon>
                    <UserIcon />
                  </InputGroupAddon>
                </InputGroup>

                {fieldState.invalid && (
                  <FieldError errors={[{ message: t('error.name_required') }]} />
                )}
              </Field>
            )}
          />
          <Controller
            name='email'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='form-signup-email'>{t('email')}</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id='form-signup-email'
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

                {fieldState.invalid && (
                  <FieldError errors={[{ message: t('error.email_required') }]} />
                )}
              </Field>
            )}
          />
          <Controller
            name='password'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='form-signup-password'>{t('password')}</FieldLabel>
                <InputGroup className='focus:outline-none focus:ring-1 focus:ring-blue-600'>
                  <InputGroupInput
                    {...field}
                    id='form-signup-password'
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
                {fieldState.invalid && (
                  <FieldError errors={[{ message: t('error.password_too_short') }]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <div className='mt-6'>
          <Controller
            name='termsAccepted'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className='flex items-center gap-2'>
                  <Checkbox
                    id='form-signup-terms'
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
                  <Label htmlFor='form-signup-terms' className='text-sm leading-normal'>
                    <Link href='/terms' className='text-primary hover:underline underline-offset-4'>
                      {t('terms_accept')}
                    </Link>
                  </Label>
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[{ message: t('error.terms_required') }]} />
                )}
              </Field>
            )}
          />
        </div>
        <Button
          disabled={isPending || !termsAccepted}
          type='submit'
          className='block! px-6 py-2 mt-8 w-full rounded-lg text-white hover:bg-secondary hover:border-secondary transition-all duration-300'
        >
          {t('signup')}
        </Button>
      </form>
    </CardWrapper>
  )
}
