'use client'
import { authClient } from '@/lib/auth-client'
import { ResetSchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { MailIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import z from 'zod'

import { CardWrapper } from './CardWrapper'
import { Button } from './ui/button'
import { Field, FieldError, FieldGroup } from './ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import { useCooldown } from '@/hooks/use-cooldown'
import { useRouter } from 'next/navigation'

type Props = {
  email: string | undefined
}

const COOLDOWN_SECONDS = 60

function formatCooldown(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

export function ResendEmailForm({ email }: Props) {

  const router = useRouter()
  const t = useTranslations('handledmoney.auth')
  const [isPending, setLoading] = useState(false)
  const { cooldownSeconds, start: startCooldown } = useCooldown(COOLDOWN_SECONDS)

  const isCooldownActive = cooldownSeconds > 0
  const isSubmitDisabled = isPending || isCooldownActive

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: { email: email || '' },
  })

  const buttonLabel = useMemo(() => {
    if (isPending) return t('sending')
    if (isCooldownActive) return t('resend_email_cooldown', { time: formatCooldown(cooldownSeconds) })
    return t('send_verification_email')
  }, [cooldownSeconds, isCooldownActive, isPending, t])

  const handleSubmit = async (data: z.infer<typeof ResetSchema>) => {
    if (isSubmitDisabled) return
    setLoading(true)

    const { error } = await authClient.sendVerificationEmail({
      email: data.email,
      callbackURL: '/auth/new-verification?redirect=false',
    })

    if (!error) {
      toast.success(t('success.email_sent'))
      startCooldown()
    } else if (error.status === 429) {
      toast.error(t('error.too_many_requests'))
      startCooldown()
    } else {
      toast.error(t('error.unknown_error'))
    }

    setLoading(false)
  }

  return (
    <CardWrapper
      headerLabel={''}
      backButtonHref='/auth/login'
      backButtonLabel={t('back_to_login')}
      callbackUrl={'/'}
      isPending={isPending}
      classname='mx-auto pt-2'
    >
      <form id='form-new-verification' onSubmit={form.handleSubmit(handleSubmit)}>
        <div className='space-y-4'>
          <FieldGroup>
            <Controller
              name='email'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
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

        <Button
          disabled={isSubmitDisabled}
          type='submit'
          className='block! px-6 py-2 mt-8 w-full text-white rounded-lg hover:bg-secondary transition-all duration-300 disabled:opacity-70'
        >
          {buttonLabel}
        </Button>
      </form>
    </CardWrapper>
  )
}
