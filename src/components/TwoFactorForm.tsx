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
      form.setError('code', { type: 'manual', message: 'Code is required' })
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
              <InputGroup className='w-full border rounded-md focus:outline-none focus:ring-1! focus:ring-blue-600!'>
                <InputGroupInput
                  {...field}
                  id='form-signin-code'
                  aria-invalid={fieldState.invalid}
                  placeholder={isBackupMode ? 'a1b2c3d4e5' : '000000'}
                  autoComplete='off'
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
      <Button
        disabled={isPending}
        type='submit'
        className='block! px-6 py-2 mt-8 w-full text-white rounded-lg hover:bg-secondary transition-all duration-300'
      >
        {isPending ? 'Verifying...' : t('confirm')}
      </Button>

      <div className='mt-4 text-center'>
        <button
          type='button'
          onClick={() => {
            setIsBackupMode(!isBackupMode)
            form.reset()
          }}
          disabled={isPending}
          className='text-sm text-secondary hover:underline transition-all'
        >
          {isBackupMode ? t('use_authenticator') : t('use_backup_code')}
        </button>
      </div>
    </form>
  )
}
