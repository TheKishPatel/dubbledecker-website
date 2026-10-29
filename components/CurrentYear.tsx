'use client'

import { useEffect, useState } from 'react'

// The pages are exported once, so the year baked in at build goes stale; the visitor's clock corrects it
// after hydration (rendering it directly on the client would mismatch the static HTML).
export default function CurrentYear({ built }: { built: number }) {
  const [year, setYear] = useState(built)
  useEffect(() => setYear(new Date().getFullYear()), [])
  return <>{year}</>
}
