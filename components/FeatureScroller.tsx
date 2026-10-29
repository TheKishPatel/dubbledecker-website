'use client'

import { useEffect, useRef, useState } from 'react'
import Phone from './Phone'
import ScreenVideo from './ScreenVideo'

export interface Feature {
  video: string
  eyebrow: string
  title: string
  body: string
  /** River features are drawn in the app's river blue rather than bus red. */
  river?: boolean
}

/**
 * One phone, pinned, whose screen changes as the copy scrolls past it.
 * Below `lg` the pinned phone gives way to a phone per feature.
 */
export default function FeatureScroller({ features }: { features: Feature[] }) {
  const [active, setActive] = useState(0)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    // A step is active while it crosses the middle of the viewport.
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index))
        })
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    stepRefs.current.forEach(el => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 lg:grid-cols-[1fr_auto] lg:gap-24">
      {/* Copy */}
      <div>
        {features.map((f, i) => (
          <div
            key={f.video}
            ref={el => { stepRefs.current[i] = el }}
            data-index={i}
            className="flex flex-col justify-center py-16 lg:min-h-[100svh] lg:py-0"
          >
            <div
              className="transition-opacity duration-500 lg:opacity-[var(--o)]"
              style={{ '--o': active === i ? 1 : 0.2 } as React.CSSProperties}
            >
              <p
                className="mb-5 text-[15px] font-semibold tracking-[-0.01em]"
                style={{ color: f.river ? 'var(--dd-blue)' : 'var(--dd-red)' }}
              >
                {f.eyebrow}
              </p>
              <h3 className="display-lg max-w-[12ch] text-ink">{f.title}</h3>
              <p className="body-lg mt-6 max-w-[30ch] text-ink/55">{f.body}</p>
            </div>

            {/* Small screens: each feature gets its own phone */}
            <div className="mt-12 flex justify-center lg:hidden">
              <Phone style={{ width: 'min(72vw, 300px)' }}>
                <ScreenVideo name={f.video} label={f.title} />
              </Phone>
            </div>
          </div>
        ))}
      </div>

      {/* Large screens: one pinned phone */}
      <div className="hidden lg:block">
        <div className="sticky top-0 flex h-[100svh] items-center">
          <Phone style={{ width: 'clamp(300px, 24vw, 360px)' }}>
            {features.map((f, i) => (
              <div
                key={f.video}
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity: active === i ? 1 : 0 }}
                aria-hidden={active !== i}
              >
                <ScreenVideo name={f.video} active={active === i} label={f.title} className="h-full w-full object-cover" />
              </div>
            ))}
          </Phone>

          {/* Progress */}
          <ol className="absolute -right-10 top-1/2 flex -translate-y-1/2 flex-col gap-2" aria-hidden>
            {features.map((f, i) => (
              <li
                key={f.video}
                className="h-1.5 w-1.5 rounded-full transition-all duration-500"
                style={{
                  background: active === i ? (f.river ? 'var(--dd-blue)' : 'var(--dd-red)') : 'rgba(0,0,0,0.15)',
                  transform: active === i ? 'scale(1.35)' : 'scale(1)',
                }}
              />
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
