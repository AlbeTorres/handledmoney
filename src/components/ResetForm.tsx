'use client'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'

import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { authClient } from '@/lib/auth-client'
import { ResetSchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { MailIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import { AuthMessage } from './AuthMessage'
import { CardWrapper } from './CardWrapper'

export const ResetForm = () => {
  const t = useTranslations('handledmoney.auth')
  const [isPending, setLoading] = useState(false)
  const [message, setMessage] = useState<{ message: string; type: 'error' | 'success' | null }>({
    message: '',
    type: null,
  })

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: '',
    },
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const handleSubmit = async (data: z.infer<typeof ResetSchema>) => {
    setLoading(true)
    const { error } = await authClient.requestPasswordReset({
      email: data.email,
      redirectTo: 'http://localhost:3000/auth/reset-password', // tu página del paso 2
    })

    if (error?.message) {
      setMessage({ message: error.message, type: 'error' })
    } else {
      setMessage({ message: 'Te enviamos un correo de recuperación', type: 'success' })
    }
    setLoading(false)
  }
  return (
    <CardWrapper
      headerLabel='Forgot your password'
      backButtonHref='/auth/login'
      backButtonLabel='Back to login'
      callbackUrl={callbackUrl}
      isPending={isPending}
    >
      <form id='form-reset' onSubmit={form.handleSubmit(handleSubmit)}>
        <div className='mt-4 space-y-4'>
          <FieldGroup>
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
          className='block! px-6 py-2 mt-8 w-full text-white  rounded-lg hover:bg-secondary transition-all duration-300'
        >
          Send reset email
        </Button>
      </form>
    </CardWrapper>
  )
}
