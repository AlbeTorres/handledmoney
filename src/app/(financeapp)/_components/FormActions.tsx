import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface FormActionsProps {
  onCancel: () => void
  isPending: boolean
}

export function FormActions({ onCancel, isPending }: FormActionsProps) {
  return (
    <div className='flex flex-col-reverse sm:flex-row justify-end items-center gap-4 px-8 py-5 border-t border-slate-100 dark:border-slate-800'>
      <Button
        type='button'
        variant='ghost'
        onClick={onCancel}
        disabled={isPending}
        className='w-full sm:w-auto'
      >
        Cancel
      </Button>
      <Button type='submit' disabled={isPending} className='w-full sm:w-auto px-10'>
        {isPending ? (
          <>
            <Loader2 aria-hidden='true' className='size-4 animate-spin' />
            Creating…
          </>
        ) : (
          'Create Account'
        )}
      </Button>
    </div>
  )
}
