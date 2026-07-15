'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ActionBar from './ActionBar'

export default function AccountAction() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchTerm) {
        params.set('search', searchTerm)
      } else {
        params.delete('search')
      }

      const newQueryString = params.toString()
      if (newQueryString !== searchParams.toString()) {
        router.push(`${pathname}?${newQueryString}`, { scroll: false })
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, pathname, router, searchParams])
  return (
    <>
      <ActionBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        href='/account/create'
        id='account-search'
        placeholder='Search accounts...'
        ariaLabel='Search accounts'
        buttonText='New Account'
      />
    </>
  )
}
