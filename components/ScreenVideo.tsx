'use client'

import { useEffect, useRef, useState } from 'react'

interface ScreenVideoProps {
  /** Basename in /public/media — expects `<name>.mp4` and `<name>.jpg`. */
  name: string
  /**
   * When given, the parent decides which video is showing; it restarts from
   * the top each time it becomes active. Either way, a video only plays while
   * it's on screen — browsers abort off-screen muted playback to save power.
   */
  active?: boolean
  className?: string
  label?: string
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function ScreenVideo({ name, active, className = '', label }: ScreenVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const [visible, setVisible] = useState(false)
  const wasActive = useRef(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 })
    io.observe(video)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const video = ref.current
    if (!video) return

    const showing = active ?? true
    if (showing && !wasActive.current) video.currentTime = 0
    wasActive.current = showing

    if (showing && visible && !prefersReducedMotion()) video.play().catch(() => {})
    else video.pause()
  }, [active, visible])

  return (
    <video
      ref={ref}
      className={className}
      src={`/media/${name}.mp4`}
      poster={`/media/${name}.jpg`}
      muted
      loop
      playsInline
      preload={active === false ? 'none' : 'metadata'}
      aria-label={label}
    />
  )
}
