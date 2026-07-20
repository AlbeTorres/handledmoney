'use client'

import { ReactNode, useRef } from 'react'
import { useTilt } from '@/hooks/use-tilt'

interface TiltCardWrapperProps {
  children: ReactNode
  maxTilt?: number
  scale?: number
}

/**
 * Wrapper that adds a 3D tilt effect to its children.
 * All visual styling (perspective, transform-style, lighting overlay, transitions)
 * comes from globals.css via .tilt-container and .tilt-card classes.
 * This component only manages the ref and delegates to useTilt.
 */
export function TiltCardWrapper({ children, maxTilt, scale }: TiltCardWrapperProps) {
  const tiltRef = useRef<HTMLDivElement>(null)

  useTilt(tiltRef, { maxTilt, scale })

  return (
    <div className='tilt-container'>
      <div ref={tiltRef} className='tilt-card'>
        {children}
      </div>
    </div>
  )
}
