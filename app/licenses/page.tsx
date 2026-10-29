import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import licenses from './licenses.json'

// Linked from the app's Info screen as dubbledecker.com/licenses.html — the
// static export writes this route to exactly that file.
export const metadata: Metadata = {
  title: 'Licences — Dubbledecker',
}

export default function Licenses() {
  return (
    <main>
      <article className="mx-auto max-w-[720px] px-5 pt-16 md:px-8 md:pt-24">
        <a href="/" className="font-pacifico text-[28px] text-[var(--dd-red)]">
          Dubbledecker
        </a>
        <h1 className="display-lg mt-16">Licences</h1>
        <p className="body-lg mt-6 text-ink/55">
          Dubbledecker is built with the help of these open source projects. Bus and river bus data is powered by TfL Open
          Data and contains OS data © Crown copyright and database rights.
        </p>
        <div className="mt-16 space-y-14">
          {licenses.map(l => (
            <section key={l.name}>
              <h2 className="display-md">{l.name}</h2>
              <pre className="mt-5 whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-ink/55">{l.text}</pre>
            </section>
          ))}
        </div>
      </article>
      <Footer />
    </main>
  )
}
