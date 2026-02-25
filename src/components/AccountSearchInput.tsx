'use client'

import { Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'

export function AccountSearchInput() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [value, setValue] = useState(searchParams.get('search') || '')

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('search', value)
      } else {
        params.delete('search')
      }

      const newQueryString = params.toString()
      if (newQueryString !== searchParams.toString()) {
        router.push(`${pathname}?${newQueryString}`, { scroll: false })
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [value, pathname, router, searchParams])

  return (
    <InputGroup className='w-full border rounded-md focus-within:ring-1 focus-within:ring-blue-600 transition-all'>
      <InputGroupInput
        id='account-search'
        aria-label='Search accounts'
        placeholder='Search accounts...'
        autoComplete='off'
        type='text'
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <InputGroupAddon>
        <Search className='size-4 text-slate-400' aria-hidden='true' />
      </InputGroupAddon>
    </InputGroup>
  )
}
