// hooks/use-confirm-password.ts
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
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import z from 'zod'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  submitLabel?: string
  fieldLabel?: string
  isPending: boolean
  onCancel: () => void
  onSubmit: (password: string) => void
}

// Componente real, declarado una sola vez a nivel de módulo.
// Reference estable → React nunca lo confunde con "otro componente".
export function PasswordConfirmDialog({
  open,
  title,
  description,
  submitLabel,
  fieldLabel,
  isPending,
  onCancel,
  onSubmit,
}: ConfirmDialogProps) {
  const [showPassword, setShowPassword] = useState(false)
  const t = useTranslations('handledmoney.auth')

  const form = useForm<z.infer<typeof ChangePasswordSchema>>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: { password: '' },
  })

  useEffect(() => {
    if (!open) {
      form.reset()
      setShowPassword(false)
    }
  }, [open, form])

  return (
    <Dialog open={open} onOpenChange={v => !v && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form id='confirm-password-form' onSubmit={form.handleSubmit(v => onSubmit(v.password))}>
          <Controller
            name='password'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='form-signin-password'>
                  {fieldLabel ?? t('password')}
                </FieldLabel>
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
                      onClick={() => setShowPassword(v => !v)}
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
          <Button onClick={onCancel} variant='outline' disabled={isPending} type='button'>
            Cancel
          </Button>
          <Button type='submit' form='confirm-password-form' disabled={isPending}>
            {isPending ? 'Verifying...' : (submitLabel ?? 'Continue')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type UseConfirmActionOptions<TResult> = {
  title: string
  description: string
  submitLabel?: string
  fieldLabel?: string
  onSubmit: (password: string) => Promise<TResult>
}

// El hook SOLO maneja estado y lógica. Cero JSX.
export function useConfirmAction<TResult>(opts: UseConfirmActionOptions<TResult>) {
  const [promise, setPromise] = useState<{ resolve: (v: TResult | null) => void } | null>(null)
  const [isPending, setIsPending] = useState(false)

  const confirm = () => new Promise<TResult | null>(resolve => setPromise({ resolve }))

  const handleCancel = () => {
    promise?.resolve(null)
    setPromise(null)
  }

  const handleSubmit = async (password: string) => {
    setIsPending(true)
    try {
      const result = await opts.onSubmit(password)
      promise?.resolve(result)
      setPromise(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setIsPending(false)
    }
  }

  const dialogProps: ConfirmDialogProps = {
    open: promise !== null,
    title: opts.title,
    description: opts.description,
    submitLabel: opts.submitLabel,
    fieldLabel: opts.fieldLabel,
    isPending,
    onCancel: handleCancel,
    onSubmit: handleSubmit,
  }

  return { confirm, dialogProps }
}
