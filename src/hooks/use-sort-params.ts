// hooks/useSortParam.ts
'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function useSortParam(key = 'sort', defaultValue = 'default') {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const value = searchParams.get(key) || defaultValue

  const setValue = (newValue: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newValue && newValue !== defaultValue) {
      params.set(key, newValue)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return [value, setValue] as const
}
