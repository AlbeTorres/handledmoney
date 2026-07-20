import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'

type Props = {
  searchTerm: string
  setSearchTerm: (value: string) => void
  href: string
  id: string
  placeholder: string
  ariaLabel: string
  buttonText: string
}

export default function ActionBar({
  searchTerm,
  setSearchTerm,
  href,
  id,
  placeholder,
  ariaLabel,
  buttonText,
}: Props) {
  return (
    <div className='flex flex-col md:flex-row items-center justify-center gap-4'>
      <InputGroup className='w-full max-w-md border rounded-md'>
        <InputGroupInput
          id={id}
          aria-label={ariaLabel}
          placeholder={placeholder}
          autoComplete='off'
          type='text'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <InputGroupAddon>
          <Search className='size-4 text-slate-400' aria-hidden='true' />
        </InputGroupAddon>
      </InputGroup>

      <Link
        href={href}
        className='flex items-center gap-2 bg-primary text-white hover:bg-secondary transition-all duration-300 px-4 py-2.5 rounded-md text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105'
      >
        <Plus className='size-4' />
        {buttonText}
      </Link>
    </div>
  )
}
