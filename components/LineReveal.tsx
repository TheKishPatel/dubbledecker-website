'use client'

import React, { useEffect, useRef, useState } from 'react'

interface LineRevealProps {
  text: string
  className?: string
  style?: React.CSSProperties
}

export default function LineReveal({ text, className = '', style }: LineRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [lines, setLines] = useState<string[] | null>(null)
  const wipeRefs = useRef<(HTMLSpanElement | null)[]>([])

  // ── Measure rendered line breaks via off-screen clone ──
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function measure() {
      const el = containerRef.current
      if (!el) return

      const words = text.split(' ')
      const clone = el.cloneNode(false) as HTMLDivElement
      clone.style.cssText += [
        'position:fixed',
        'left:-9999px',
        'top:-9999px',
        'visibility:hidden',
        `width:${el.offsetWidth}px`,
        'height:auto',
        'pointer-events:none',
      ].join(';')
      clone.innerHTML = words.map(w => `<span data-w>${w}</span>`).join(' ')
      document.body.appendChild(clone)

      const lineMap = new Map<number, string[]>()
      clone.querySelectorAll('[data-w]').forEach(span => {
        const top = Math.round((span as HTMLElement).getBoundingClientRect().top)
        if (!lineMap.has(top)) lineMap.set(top, [])
        const word = (span.textContent || '').trim()
        if (word) lineMap.get(top)!.push(word)
      })
      document.body.removeChild(clone)

      const sorted = Array.from(lineMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([, ws]) => ws.join(' '))

      setLines(sorted)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(container)
    return () => ro.disconnect()
  }, [text])

  // ── Scroll-scrubbed reveal ──
  useEffect(() => {
    const el = containerRef.current
    if (!el || !lines || lines.length === 0) return

    const n = lines.length
    let rafId: number | null = null

    const update = () => {
      rafId = null
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight

      // globalProgress: 0 when element top hits 90% of viewport (just entering),
      // 1 when element top is at 20% of viewport (well into view).
      // Scroll ~70% of a viewport height to go from 0 → 1.
      const raw = (vh * 0.9 - rect.top) / (vh * 0.7)
      const globalProgress = Math.max(0, Math.min(1, raw))

      wipeRefs.current.forEach((span, i) => {
        if (!span) return
        // Each line gets an equal slice of the global progress range [0, 1]
        const start = i / n
        const end = (i + 1) / n
        const lineProgress = Math.max(0, Math.min(1, (globalProgress - start) / (end - start)))
        span.style.clipPath = `inset(0 ${((1 - lineProgress) * 100).toFixed(2)}% 0 0)`
      })
    }

    const onScroll = () => {
      if (rafId === null) rafId = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [lines])

  return (
    <div ref={containerRef} className={className} style={style} aria-label={text}>
      {lines === null ? (
        <span style={{ visibility: 'hidden' }}>{text}</span>
      ) : (
        lines.map((line, i) => (
          <div key={i} style={{ position: 'relative' }}>
            {/* Ghost — faintly visible before the wipe */}
            <span aria-hidden="true" style={{ display: 'block', opacity: 0.22 }}>
              {line}
            </span>
            {/* Wipe layer — driven directly by scroll via ref, no CSS transition */}
            <span
              ref={el => { wipeRefs.current[i] = el }}
              aria-hidden="true"
              style={{
                display: 'block',
                position: 'absolute',
                inset: 0,
                clipPath: 'inset(0 100% 0 0)',
              }}
            >
              {line}
            </span>
          </div>
        ))
      )}
    </div>
  )
}
