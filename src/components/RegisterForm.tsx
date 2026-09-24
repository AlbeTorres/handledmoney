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
import { Controller, useForm, useWatch } from 'react-hook-form'
import toast from 'react-hot-toast'
import z from 'zod'

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

  const termsAccepted = useWatch({ control: form.control, name: 'termsAccepted' })

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
      toast.success(t('success.account_created'), {
        duration: 5000,
      })
      router.replace(`/auth/new-verification?email=${encodeURIComponent(data.email)}`)
    }
  }

  return (
    <>
      <form id='form-signup' onSubmit={form.handleSubmit(handleSubmit)}>
        <FieldGroup>
          <Controller
            name='name'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='form-signup-name'>{t('name')}</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id='form-signup-name'
                    aria-invalid={fieldState.invalid}
                    placeholder={t('name_placeholder')}
                    autoComplete='name'
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
                    autoComplete='email'
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
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id='form-signup-password'
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
        <Button disabled={isPending || !termsAccepted} type='submit' className='mt-8 w-full'>
          {isPending ? t('creating_account') : t('signup')}
        </Button>
      </form>
    </>
  )
}
