'use client'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { authClient } from '@/lib/auth-client'
import { LoginSchema } from '@/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { EyeOffIcon, MailIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { AuthMessage } from './AuthMessage'
import { CardWrapper } from './CardWrapper'

export const LoginForm = () => {
  const router = useRouter()
  const t = useTranslations('handledmoney.auth')
  const [isPending, startTransition] = useTransition()
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
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: '/dashboard',
    })

    if (error) {
      alert(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <CardWrapper
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
                    type='password'
                    disabled={isPending}
                  />
                  <InputGroupAddon>
                    <EyeOffIcon />
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
          className='block! px-6 py-2 mt-8 w-full text-white bg-blue-600 rounded-lg hover:bg-blue-900 transition-all duration-300'
        >
          {showTwoFactor ? t('confirm') : t('signin')}
        </Button>
      </form>
    </CardWrapper>
  )
}

{
  /* <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {showTwoFactor ? (
            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('two_factor_title')}</FormLabel>
                  <FormControl>
                    <Input
                      className='w-full px-4 py-2 border rounded-md  focus:outline-none focus:!ring-1 focus:!ring-blue-600'
                      {...field}
                      placeholder='123456'
                      type='code'
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className='mt-4 space-y-4'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input
                        className='w-full px-4 py-2 border rounded-md  focus:outline-none focus:!ring-1 focus:!ring-blue-600'
                        {...field}
                        placeholder='jhon.doe@example.com'
                        type='email'
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('password')}</FormLabel>
                    <FormControl>
                      <Input
                        className='w-full px-4 py-2 border rounded-md  focus:outline-none focus:!ring-1 focus:!ring-blue-600'
                        {...field}
                        placeholder='password'
                        type='password'
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          <AuthMessage className='my-4' type={message.type} message={message.message} />
          <Button
            disabled={isPending}
            type='submit'
            className='!block px-6 py-2 mt-8 w-full text-white bg-blue-600 rounded-lg hover:bg-blue-900 transition-all duration-300'
          >
            {showTwoFactor ? t('confirm') : t('login')}
          </Button>
        </form>
      </Form> */
}
