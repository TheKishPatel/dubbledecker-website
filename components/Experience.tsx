'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import AppStoreButton from './AppStoreButton'
import Footer from './Footer'
import { BACKGROUNDS, FEATURES, FINISHES, GUARDIAN_URL } from './features'

type Studio = ReturnType<typeof import('./studio/engine.js').createStudio>

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Experience() {
  const [featureIdx, setFeatureIdx] = useState(0)
  const [bgId, setBgId] = useState(FEATURES[0].bg)
  const [finishId, setFinishId] = useState(FEATURES[0].finish)
  const [shown, setShown] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const studioRef = useRef<Studio | null>(null)

  const feature = FEATURES[featureIdx]
  const bg = BACKGROUNDS.find(b => b.id === bgId) ?? BACKGROUNDS[0]

  function pick(i: number) {
    setFeatureIdx(i)
    setBgId(FEATURES[i].bg)
    setFinishId(FEATURES[i].finish)
  }

  // boot the 3D phone once; wait briefly for the detailed model so it doesn't swap in after the fade
  useEffect(() => {
    let cancelled = false
    let studio: Studio | null = null
    import('./studio/engine.js').then(async ({ createStudio }) => {
      if (cancelled || !canvasRef.current) return
      studio = createStudio(canvasRef.current)
      studioRef.current = studio
      studio.setBackground(bg.color)
      studio.setFinish(finishId)
      frame()
      await Promise.race([studio.ready, new Promise(r => setTimeout(r, 6000))])
      if (cancelled) return
      await studio.setScreen(feature.screen, { animate: false })
      if (!cancelled) setShown(true)
    })

    const mq = window.matchMedia('(min-width: 1024px)')
    function frame() {
      studioRef.current?.setFraming(mq.matches ? { zoom: 74, offsetY: -6 } : { zoom: 76, offsetY: 1 })
    }
    mq.addEventListener('change', frame)

    // the phone leans gently towards the pointer
    function onMove(e: PointerEvent) {
      if (e.pointerType !== 'mouse' || reducedMotion()) return
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      studioRef.current?.setPointer(x, y)
    }
    window.addEventListener('pointermove', onMove)

    return () => {
      cancelled = true
      mq.removeEventListener('change', frame)
      window.removeEventListener('pointermove', onMove)
      studio?.dispose()
      studioRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (shown) studioRef.current?.setScreen(feature.screen, { animate: !reducedMotion() })
  }, [feature.screen, shown])
  useEffect(() => { studioRef.current?.setBackground(bg.color) }, [bg.color])
  useEffect(() => { studioRef.current?.setFinish(finishId) }, [finishId])

  const controls = { featureIdx, pick, bgId, setBgId, finishId, setFinishId }

  return (
    <div
      className="min-h-svh bg-[var(--bg)] font-display text-white transition-colors duration-700 ease-out"
      style={{ '--bg': bg.color } as CSSProperties}
    >
      {/* overflow-clip, not hidden: a hidden box can still be scrolled when a pill takes focus */}
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-clip lg:min-h-[max(100svh,760px)]">
        {/* backgrounds: the wallpaper (for widgets) fades over the colour */}
        {BACKGROUNDS.filter(b => b.image).map(b => (
          <div
            key={b.id}
            aria-hidden
            className="absolute inset-0 -z-20 scale-110 bg-cover bg-center blur-[2px] transition-opacity duration-700"
            style={{ backgroundImage: `url(${b.image})`, opacity: b.id === bgId ? 1 : 0 }}
          />
        ))}
        <div aria-hidden className="hero-vignette absolute inset-0 -z-10" />
        <canvas
          ref={canvasRef}
          aria-hidden
          className={`pointer-events-none absolute inset-0 -z-10 h-full w-full transition-[opacity,transform] duration-1000 ease-out ${shown ? 'opacity-100' : 'translate-y-6 opacity-0'}`}
        />

        <header className="flex items-center justify-between px-5 pt-5 md:px-10 md:pt-8">
          <a href="/" className="font-pacifico text-[26px] leading-none md:text-[32px]">
            Dubbledecker
          </a>
          <AppStoreButton variant="light" size="md" />
        </header>

        <h1 className="sr-only">Dubbledecker: live London bus, tram and river bus times for iPhone</h1>

        <p key={feature.id} aria-live="polite" className="feature-title px-5 pt-8 text-center md:pt-6">
          {feature.title}
        </p>

        <div className="grid flex-1 grid-cols-1 px-5 md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-8 lg:pb-16">
          <aside className="hidden flex-col items-start gap-10 lg:flex">
            <Quote />
            <AppStoreButton variant="light" size="lg" />
          </aside>
          <div />
          <div className="hidden justify-self-end lg:block">
            <Controls {...controls} layout="list" />
          </div>
        </div>

        <div className="sticky bottom-0 z-10 pb-4 pt-2 lg:hidden">
          <Controls {...controls} layout="row" />
        </div>
      </section>

      <section className="flex flex-col items-center gap-10 px-5 py-20 text-center lg:hidden">
        <Quote centred />
        <AppStoreButton variant="light" size="lg" />
      </section>

      <Footer />
    </div>
  )
}

function Quote({ centred = false }: { centred?: boolean }) {
  return (
    <figure className={`flex flex-col gap-7 ${centred ? 'items-center' : 'items-start'}`}>
      <blockquote className="quote max-w-[440px]">
        “It’s <em>fast</em> and <em>simple to use</em>, leaving you more precious seconds to run for the 218”
      </blockquote>
      <figcaption>
        <a href={GUARDIAN_URL} target="_blank" rel="noopener noreferrer" className="block transition-opacity hover:opacity-75">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/press/guardian-white.png" alt="Read the review in The Guardian" className="h-12 w-auto md:h-14" />
        </a>
      </figcaption>
    </figure>
  )
}

type ControlsProps = {
  featureIdx: number
  pick: (i: number) => void
  bgId: string
  setBgId: (id: string) => void
  finishId: string
  setFinishId: (id: string) => void
  layout: 'list' | 'row'
}

function Controls({ featureIdx, pick, bgId, setBgId, finishId, setFinishId, layout }: ControlsProps) {
  const list = layout === 'list'
  return (
    <div className={list ? 'flex flex-col items-start gap-8' : 'flex flex-col gap-3'}>
      <ul
        aria-label="Features"
        className={list ? 'flex flex-col items-start gap-2' : 'no-scrollbar flex gap-2 overflow-x-auto px-5 md:px-10'}
      >
        {FEATURES.map((f, i) => (
          <li key={f.id} className="pill-in shrink-0" style={{ animationDelay: `${300 + i * 60}ms` }}>
            <button
              type="button"
              aria-pressed={i === featureIdx}
              onClick={() => pick(i)}
              className="pill"
            >
              {f.title}
            </button>
          </li>
        ))}
      </ul>

      {/* row: centred when it fits, scrolls sideways when it doesn't */}
      <div className={list ? 'flex flex-col gap-4' : 'no-scrollbar overflow-x-auto px-5'}>
        <div className={list ? 'contents' : 'mx-auto flex w-max gap-5'}>
          <SwatchGroup label="Background" delay={list ? 300 + FEATURES.length * 60 : 0}>
            {BACKGROUNDS.map(b => (
              <Swatch
                key={b.id}
                name={b.name}
                selected={b.id === bgId}
                onSelect={() => setBgId(b.id)}
                style={b.image ? { backgroundImage: `url(${b.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: b.color }}
              />
            ))}
          </SwatchGroup>
          <SwatchGroup label="Phone" delay={list ? 360 + FEATURES.length * 60 : 0}>
            {FINISHES.map(f => (
              <Swatch key={f.id} name={f.name} selected={f.id === finishId} onSelect={() => setFinishId(f.id)} style={{ background: f.swatch }} />
            ))}
          </SwatchGroup>
        </div>
      </div>
    </div>
  )
}

function SwatchGroup({ label, children, delay }: { label: string; children: React.ReactNode; delay: number }) {
  return (
    <div role="group" aria-label={label} className="pill-in flex items-center gap-3" style={{ animationDelay: `${delay}ms` }}>
      <span className="hidden w-[92px] text-[13px] font-medium text-white/60 lg:inline">{label}</span>
      <div className="flex gap-1.5">{children}</div>
    </div>
  )
}

function Swatch({ name, selected, onSelect, style }: { name: string; selected: boolean; onSelect: () => void; style: CSSProperties }) {
  return (
    <button type="button" aria-label={name} aria-pressed={selected} title={name} onClick={onSelect} className="swatch">
      <span className="block h-full w-full rounded-full" style={style} />
    </button>
  )
}
