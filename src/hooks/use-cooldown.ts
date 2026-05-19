import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'email_cooldown_until'

function getRemainingSeconds(): number {
  if (typeof window === 'undefined') return 0
  const storedUntil = localStorage.getItem(STORAGE_KEY)
  if (!storedUntil) return 0
  const remaining = Math.ceil((parseInt(storedUntil, 10) - Date.now()) / 1000)
  return remaining > 0 ? remaining : 0
}

export function useCooldown(defaultSeconds: number) {
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const startTimer = () => {
    stopTimer()
    
    const tick = () => {
      const remaining = getRemainingSeconds()
      setCooldownSeconds(remaining)
      if (remaining <= 0) {
        stopTimer()
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    tick()
    intervalRef.current = setInterval(tick, 1000)
  }

  useEffect(() => {
    const remaining = getRemainingSeconds()
    if (remaining > 0) {
      startTimer()
    }
    return () => stopTimer()
  }, [])

  const start = (seconds = defaultSeconds) => {
    localStorage.setItem(STORAGE_KEY, String(Date.now() + seconds * 1000))
    startTimer()
  }

  return { cooldownSeconds, start }
}
