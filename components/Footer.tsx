const links = [
  { label: 'Support', href: 'mailto:dubbledecker@kishpatel.com?subject=Dubbledecker%20support' },
  { label: 'Contact', href: 'mailto:dubbledecker@kishpatel.com?subject=Contact%20Dubbledecker' },
  { label: 'verynicesoftware.com', href: 'https://verynicesoftware.com' },
  { label: 'Privacy', href: '/privacy.html' },
  { label: 'Licences', href: '/licenses.html' },
]

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-white/15">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-8 px-5 pt-16 text-center md:px-8 md:pt-20">
        <nav className="flex flex-wrap justify-center gap-x-7 gap-y-2 text-[15px] font-medium tracking-[-0.01em]">
          {links.map(l => (
            <a key={l.label} href={l.href} className="text-white/70 transition-colors hover:text-white">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex max-w-[640px] flex-col gap-2 text-[12px] leading-relaxed text-white/50">
          <p>© {year} Very Nice Software Limited. All rights reserved.</p>
          <p>
            Powered by TfL Open Data. Contains OS data © Crown copyright and database rights. Dubbledecker is not
            affiliated with or endorsed by Transport for London.
          </p>
          <p>
            Apple, the Apple logo and iPhone are trademarks of Apple Inc., registered in the U.S. and other countries. App
            Store is a service mark of Apple Inc.
          </p>
        </div>
      </div>

      {/* "nice": the Very Nice Software mark, a faint fill masked to pixel-art letters */}
      <a href="https://verynicesoftware.com" className="mt-12 block" aria-label="Very Nice Software">
        <div className="nice-mask w-full bg-black/10" style={{ aspectRatio: '1226.52 / 290.447' }} />
      </a>
    </footer>
  )
}
