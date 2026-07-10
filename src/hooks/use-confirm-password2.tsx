import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { ChangePasswordSchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { JSX, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import z from 'zod'

type UseConfirmActionOptions<TResult> = {
  title: string
  description: string
  submitLabel?: string
  fieldLabel?: string // "Current Password" por defecto
  onSubmit: (password: string) => Promise<TResult> // lanza error si falla
}

export function useConfirmAction<TResult>(
  opts: UseConfirmActionOptions<TResult>,
): [JSX.Element, () => Promise<TResult | null>] {
  const [promise, setPromise] = useState<{
    resolve: (v: TResult | null) => void
  } | null>(null)

  const [showPassword, setShowPassword] = useState(false)

  const t = useTranslations('handledmoney.auth')
  const form = useForm<z.infer<typeof ChangePasswordSchema>>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      password: '',
    },
  })

  const [isPending, setIsPending] = useState(false)

  const confirm = () => new Promise<TResult | null>(resolve => setPromise({ resolve }))

  const handleClose = () => {
    setPromise(null)
    form.reset()
  }

  const handleCancel = () => {
    promise?.resolve(null)
    handleClose()
  }

  const handleConfirm = async (values: z.infer<typeof ChangePasswordSchema>) => {
    setIsPending(true)
    try {
      const result = await opts.onSubmit(values.password)
      promise?.resolve(result)
      handleClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setIsPending(false)
    }
  }

  const dialogElement = (
    <Dialog open={promise !== null}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Password</DialogTitle>
          <DialogDescription>
            Please enter your current password to setup Two-Factor Authentication.
          </DialogDescription>
        </DialogHeader>
        <form id='confirm-password-form' onSubmit={form.handleSubmit(handleConfirm)}>
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
        </form>
        <DialogFooter className='pt-2'>
          <Button onClick={handleCancel} variant='outline' disabled={isPending}>
            Cancel
          </Button>
          <Button type='submit' form='confirm-password-form' disabled={isPending}>
            {isPending ? 'Verifying...' : 'Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return [dialogElement, confirm]
}
