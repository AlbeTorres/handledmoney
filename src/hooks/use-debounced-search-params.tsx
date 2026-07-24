import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

// hooks/useSearchParamState.ts
export function useDebouncedSearchParam(key: string, delay = 300) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get(key) || '')

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      const newQueryString = params.toString()
      if (newQueryString !== searchParams.toString()) {
        const url = newQueryString ? `${pathname}?${newQueryString}` : pathname
        router.push(url, { scroll: false })
      }
    }, delay)

    return () => clearTimeout(timeoutId)
  }, [value, key, pathname, router, searchParams])

  return [value, setValue] as const
}
