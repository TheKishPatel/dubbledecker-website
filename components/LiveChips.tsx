'use client'

import { useEffect, useState } from 'react'

interface Arrival {
  id: number
  route: string
  mins: number
}

const START: Arrival[] = [
  { id: 0, route: '9', mins: 1 },
  { id: 1, route: '176', mins: 2 },
  { id: 2, route: '15', mins: 4 },
  { id: 3, route: '139', mins: 7 },
  { id: 4, route: '23', mins: 9 },
  { id: 5, route: '12', mins: 12 },
]

const ROUTES = ['9', '176', '15', '139', '23', '12', '88', '453', '159']

/**
 * The home screen's arrival chips, counting down. Every few seconds the
 * minutes tick over; a bus that arrives drops off the front and a new one
 * joins the back — roughly what a busy stop looks like in the app.
 */
export default function LiveChips({ river = false }: { river?: boolean }) {
  const [arrivals, setArrivals] = useState(START)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => {
      setArrivals(prev => {
        const next = prev.map(a => ({ ...a, mins: a.mins - 1 }))
        if (next[0].mins < 0) {
          next.shift()
          const last = next[next.length - 1]
          next.push({
            id: last.id + 1,
            route: ROUTES[Math.floor(Math.random() * ROUTES.length)],
            mins: last.mins + 2 + Math.floor(Math.random() * 3),
          })
        }
        return next
      })
    }, 2600)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-wrap gap-2" aria-label="Example live arrivals">
      {arrivals.map(a => (
        <span
          key={a.id}
          className="chip-in inline-flex h-9 items-center gap-2 rounded-[10px] bg-black/[0.05] px-3 text-[15px] tabular-nums"
        >
          <span className="font-medium" style={{ color: river ? 'var(--dd-blue)' : 'var(--dd-red)' }}>
            {a.route}
          </span>
          <span className="text-black/30">·</span>
          <span className="text-ink">{a.mins <= 0 ? 'Due' : a.mins === 1 ? '1 min' : `${a.mins} mins`}</span>
        </span>
      ))}
    </div>
  )
}
