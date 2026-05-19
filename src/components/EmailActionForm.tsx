'use client'
import { ResetSchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { MailIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

import { CardWrapper } from './CardWrapper'
import { Button } from './ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import { AuthMessage } from './AuthMessage'
import { useCooldown } from '@/hooks/use-cooldown'
import toast from 'react-hot-toast'

type Props = {
  initialEmail?: string
  headerLabelKey: string
  backButtonHref?: string
  backButtonLabelKey: string
  callbackUrl?: string
  cooldownKey?: string
  submitButtonLabelKey: string
  showFieldLabel?: boolean
  onSubmit: (email: string) => Promise<{ error?: string | null; successMessage?: string; triggerCooldown?: boolean }>
}

const COOLDOWN_SECONDS = 60

function formatCooldown(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

export function EmailActionForm({
  initialEmail = '',
  headerLabelKey,
  backButtonHref = '/auth/login',
  backButtonLabelKey,
  callbackUrl = '/',
  cooldownKey = 'email_cooldown_until',
  submitButtonLabelKey,
  showFieldLabel = false,
  onSubmit,
}: Props) {
  const t = useTranslations('handledmoney.auth')
  const [isPending, setLoading] = useState(false)


  const { cooldownSeconds, start: startCooldown } = useCooldown(COOLDOWN_SECONDS, cooldownKey)

  const isCooldownActive = cooldownSeconds > 0
  const isSubmitDisabled = isPending || isCooldownActive

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: { email: initialEmail },
  })

  const buttonLabel = useMemo(() => {
    if (isPending) return t('sending')
    if (isCooldownActive) return t('resend_email_cooldown', { time: formatCooldown(cooldownSeconds) })
    return t(submitButtonLabelKey as any)
  }, [cooldownSeconds, isCooldownActive, isPending, t, submitButtonLabelKey])

  const handleFormSubmit = async (data: z.infer<typeof ResetSchema>) => {
    if (isSubmitDisabled) return
    setLoading(true)


    const result = await onSubmit(data.email)

    if (result.error) {
      toast.error(result.error)
      if (result.triggerCooldown) {
        startCooldown()
      }
    } else if (result.successMessage) {
      toast.success(result.successMessage)
      if (result.triggerCooldown) {
        startCooldown()
      }
    }

    setLoading(false)
  }

  return (
    <CardWrapper
      headerLabel={headerLabelKey ? t(headerLabelKey as any) : ''}
      backButtonHref={backButtonHref}
      backButtonLabel={t(backButtonLabelKey as any)}
      callbackUrl={callbackUrl}
      isPending={isPending}
      classname='mx-auto pt-2'
    >
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div className='mt-4 space-y-4'>
          <FieldGroup>
            <Controller
              name='email'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  {showFieldLabel && <FieldLabel htmlFor='form-signup-email'>{t('email')}</FieldLabel>}
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
