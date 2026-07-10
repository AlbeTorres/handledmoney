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
import React, { JSX, useCallback, useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import z from 'zod'

type UseConfirmActionOptions<TResult> = {
  title: string
  description: string
  submitLabel?: string
  fieldLabel?: string
  onSubmit: (password: string) => Promise<TResult>
}

// 1. EXTRAEMOS LA UI A UN COMPONENTE REAL (Fuera del hook)
// Esto asegura que interactuar con el input no re-renderice el componente padre.
function ConfirmDialogUI<TResult>({
  isOpen,
  onCancel,
  onConfirm,
  optsRef,
}: {
  isOpen: boolean
  onCancel: () => void
  onConfirm: (password: string) => Promise<void>
  optsRef: React.MutableRefObject<UseConfirmActionOptions<TResult>>
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const t = useTranslations('handledmoney.auth')

  const form = useForm<z.infer<typeof ChangePasswordSchema>>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: { password: '' },
  })

  // Limpiar todo cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      form.reset()
      setShowPassword(false)
      setIsPending(false)
    }
  }, [isOpen, form])

  const handleConfirm = async (values: z.infer<typeof ChangePasswordSchema>) => {
    setIsPending(true)
    try {
      await onConfirm(values.password)
      // No reseteamos isPending aquí si hay éxito, porque el modal se va a desmontar
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong')
      setIsPending(false) // Solo quitamos el loader si falla
    }
  }

  const opts = optsRef.current

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{opts.title}</DialogTitle>
          <DialogDescription>{opts.description}</DialogDescription>
        </DialogHeader>
        <form id='confirm-password-form' onSubmit={form.handleSubmit(handleConfirm)}>
          <Controller
            name='password'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='form-signin-password'>
                  {opts.fieldLabel || t('password')}
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
          <Button onClick={onCancel} variant='outline' disabled={isPending} type='button'>
            Cancel
          </Button>
          <Button type='submit' form='confirm-password-form' disabled={isPending}>
            {isPending ? 'Verifying...' : opts.submitLabel || 'Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 2. EL HOOK AHORA ES LIGERO Y RETORNA UN COMPONENTE ESTABLE
export function useConfirmAction<TResult>(
  opts: UseConfirmActionOptions<TResult>,
): [() => JSX.Element, () => Promise<TResult | null>] {
  const [promise, setPromise] = useState<{ resolve: (v: TResult | null) => void } | null>(null)

  // Usamos una referencia para `opts` para evitar re-renderizados innecesarios
  // si el componente padre actualiza otros estados.
  const optsRef = useRef(opts)
  useEffect(() => {
    optsRef.current = opts
  })

  const confirm = useCallback(() => {
    return new Promise<TResult | null>(resolve => setPromise({ resolve }))
  }, [])

  // useCallback asegura que React vea la MISMA función/componente todo el tiempo
  // que el modal esté abierto, eliminando el parpadeo.
  const ConfirmDialogWrapper = useCallback(() => {
    return (
      <ConfirmDialogUI
        isOpen={promise !== null}
        onCancel={() => {
          promise?.resolve(null)
          setPromise(null)
        }}
        onConfirm={async pwd => {
          const result = await optsRef.current.onSubmit(pwd)
          promise?.resolve(result)
          setPromise(null)
        }}
        optsRef={optsRef}
      />
    )
  }, [promise])

  return [ConfirmDialogWrapper, confirm]
}
