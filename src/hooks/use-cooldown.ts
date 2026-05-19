import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'email_cooldown_until'

function getRemainingSeconds(): number {
  const storedUntil = localStorage.getItem(STORAGE_KEY)
  if (!storedUntil) return 0
  const remaining = Math.ceil((parseInt(storedUntil, 10) - Date.now()) / 1000)
  return remaining > 0 ? remaining : 0
}

export function useCooldown(defaultSeconds: number) {
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const tick = () => {
      const remaining = getRemainingSeconds()
      setCooldownSeconds(remaining)
      if (remaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    tick()
    intervalRef.current = setInterval(tick, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const start = (seconds = defaultSeconds) => {
    localStorage.setItem(STORAGE_KEY, String(Date.now() + seconds * 1000))
    setCooldownSeconds(seconds)
  }

  return { cooldownSeconds, start }
}
