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
        <h1 className='text-3xl font-extrabold text-foreground'>{title}</h1>
        <p className='text-muted-foreground font-medium'>{description}</p>
      </div>
    </div>
  )
}
