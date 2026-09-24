'use client'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { authClient } from '@/lib/auth-client'
import { TwoFactorSchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldCheckIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

export const TwoFactorForm = () => {
  const router = useRouter()
  const t = useTranslations('handledmoney.auth')
  const [isPending, startLoading] = useState(false)
  const [isBackupMode, setIsBackupMode] = useState(false)

  const form = useForm<z.infer<typeof TwoFactorSchema>>({
    resolver: zodResolver(TwoFactorSchema),
    defaultValues: {
      code: '',
    },
  })

  const handleSubmit = async (data: z.infer<typeof TwoFactorSchema>) => {
    startLoading(true)

    if (!data.code) {
      form.setError('code', { type: 'manual', message: t('error.code_required') })
      startLoading(false)
      return
    }

    const { error } = isBackupMode
      ? await authClient.twoFactor.verifyBackupCode({ code: data.code })
      : await authClient.twoFactor.verifyTotp({ code: data.code })

    startLoading(false)

    if (error) {
      toast.error(t('error.invalid_credentials') || 'Invalid 2FA code')
    } else {
      router.push('/dashboard')
    }
    return
  }

  return (
    <form id='form-signin-2fa' onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Controller
          name='code'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='form-signin-code'>
                {isBackupMode ? t('backup_code_label') : t('authenticator_label')}
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id='form-signin-code'
                  aria-invalid={fieldState.invalid}
                  placeholder={isBackupMode ? 'a1b2c3d4e5' : '000000'}
                  autoComplete='one-time-code'
                  type='text'
                  maxLength={isBackupMode ? 11 : 6}
                  disabled={isPending}
                  className='tracking-widest'
                />
                <InputGroupAddon>
                  <ShieldCheckIcon />
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Button disabled={isPending} type='submit' className='mt-8 w-full'>
        {isPending ? t('verifying') : t('confirm')}
      </Button>

      <div className='mt-4 text-center'>
        <button
          type='button'
          onClick={() => {
            setIsBackupMode(!isBackupMode)
            form.reset()
          }}
          disabled={isPending}
          className='rounded-sm text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        >
          {isBackupMode ? t('use_authenticator') : t('use_backup_code')}
        </button>
      </div>
    </form>
  )
}
