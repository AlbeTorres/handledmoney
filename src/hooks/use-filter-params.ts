// hooks/useFilterParam.ts
'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function useFilterParam(key: string) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const raw = searchParams.get(key)
  const values = raw ? raw.split(',') : []

  const setValues = (newValues: string[]) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newValues.length > 0) {
      params.set(key, newValues.join(','))
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return [values, setValues] as const
}
