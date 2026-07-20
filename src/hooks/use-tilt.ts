'use client'

import { RefObject, useEffect } from 'react'

interface TiltOptions {
  maxTilt?: number
  scale?: number
}

/**
 * Applies a subtle 3D tilt effect on mouse move.
 * Sets `element.style.transform` and `--mouse-x` / `--mouse-y` CSS custom properties.
 * All visual styling lives in globals.css via .tilt-container / .tilt-card classes.
 */
export function useTilt(ref: RefObject<HTMLElement | null>, options: TiltOptions = {}) {
  const { maxTilt = 8, scale = 1 } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Guard: respect reduced-motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motionQuery.matches) return

    // Guard: skip on touch-only devices (hover: none)
    const hoverQuery = window.matchMedia('(hover: none)')
    if (hoverQuery.matches) return

    function handleMouseMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      // Normalize to [-1, 1]
      const normalizedX = (x - centerX) / centerX
      const normalizedY = (y - centerY) / centerY

      const rotateY = normalizedX * maxTilt
      const rotateX = -normalizedY * maxTilt

      el!.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale},${scale},1)`

      // CSS custom properties for the lighting overlay
      const mousePercentX = `${(x / rect.width) * 100}%`
      const mousePercentY = `${(y / rect.height) * 100}%`
      el!.style.setProperty('--mouse-x', mousePercentX)
      el!.style.setProperty('--mouse-y', mousePercentY)
    }

    function handleMouseLeave() {
      el!.style.transform = ''
      el!.style.removeProperty('--mouse-x')
      el!.style.removeProperty('--mouse-y')
    }

    el.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [ref, maxTilt, scale])
}
