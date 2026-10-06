import { LandmarkIcon } from 'lucide-react'

interface FormAccountHeaderProps {
  title: string
  description: string
}

export function FormHeader({ title, description }: FormAccountHeaderProps) {
  return (
    <div className='flex items-center gap-4'>
      <div className='size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center'>
        <LandmarkIcon className='size-6' />
      </div>
      <div>
        <h1 className='text-3xl font-extrabold text-slate-900 dark:text-white'>{title}</h1>
        <p className='text-slate-500 dark:text-slate-400 font-medium'>{description}</p>
      </div>
    </div>
  )
}
