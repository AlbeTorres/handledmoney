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

/**
 * Coordinated multi-key filter setter. Accepts a map of key → values and
 * applies every update in a single URL push (empty arrays delete the key).
 * Consumers that need sibling params to stay consistent — e.g. the dashboard
 * period selector, where switching mode must drop or restore `month` — use
 * this instead of composing independent `useFilterParam` setters, which would
 * emit partial URLs the strict period parser rejects.
 */
export function useFilterParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setValues = (updates: Record<string, string[]>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, newValues] of Object.entries(updates)) {
      if (newValues.length > 0) {
        params.set(key, newValues.join(','))
      } else {
        params.delete(key)
      }
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return setValues
}
