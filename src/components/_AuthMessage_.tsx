import clsx from 'clsx'
// import { FaExclamationTriangle, FaRegCheckCircle } from 'react-icons/fa'

export const AuthMessage = ({
  message,
  type,
  className,
}: {
  message?: string
  type: 'error' | 'success' | null
  className?: string
}) => {
  if (!message) return null

  return (
    <div
      className={clsx(className, 'p-3 rounded-md flex items-center gap-x-2 text-sm', {
        'bg-destructive/15 text-destructive ': type === 'error',
        'bg-emerald-500/15 text-emerald-500': type === 'success',
      })}
    >
      {/* {type === 'error' ? (
        <FaExclamationTriangle className='h-4 w-4' />
      ) : (
        <FaRegCheckCircle className='h-4 w-4' />
      )} */}
      <p>{message}</p>
    </div>
  )
}
