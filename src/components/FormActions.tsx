import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2, Trash2 } from 'lucide-react'

interface FormActionsProps {
  onCancel: () => void
  isPending: boolean
  text: string
  loadingText: string
  handleDelete?: () => void
}

export function FormActions({
  onCancel,
  isPending,
  text,
  loadingText,
  handleDelete,
}: FormActionsProps) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row items-center gap-4 px-8 py-5 border-t border-slate-100 dark:border-slate-800',
        {
          'justify-between': handleDelete,
          'justify-end': !handleDelete,
        },
      )}
    >
      {handleDelete && (
        <Button
          disabled={isPending}
          type='button'
          onClick={handleDelete}
          className='size-10 flex items-center justify-center bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 transition-all disabled:opacity-50'
        >
          <Trash2 className='size-6' />
        </Button>
      )}

      <div className='flex flex-col-reverse sm:flex-row'>
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
              {loadingText}
            </>
          ) : (
            text
          )}
        </Button>
      </div>
    </div>
  )
}
