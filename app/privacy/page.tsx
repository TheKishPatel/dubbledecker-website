import type { Metadata } from 'next'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Privacy — Dubbledecker',
}

export default function Privacy() {
  return (
    <main>
      <article className="mx-auto max-w-[720px] px-5 pt-16 md:px-8 md:pt-24">
        <a href="/" className="font-pacifico text-[28px] text-[var(--dd-red)]">
          Dubbledecker
        </a>
        <h1 className="display-lg mt-16">Privacy</h1>
        <div className="body-lg mt-10 space-y-6 text-ink/70">
          <p>Dubbledecker doesn’t collect, store or share any personal information. There are no ads, no analytics and no accounts.</p>
          <p>
            <strong className="font-semibold text-ink">Location.</strong> If you allow it, your location is used to find the
            bus stops and piers near you. It’s sent to Transport for London’s API to look those stops up, and isn’t stored
            or sent anywhere else.
          </p>
          <p>
            <strong className="font-semibold text-ink">Saved stops.</strong> The stops you save are kept on your iPhone,
            where the app and its widgets can read them. They never leave your device.
          </p>
          <p>
            <strong className="font-semibold text-ink">Feedback.</strong> If you email us from the app, we’ll see your
            email address, your app version, your device model and its iOS version, and use them only to reply.
          </p>
          <p>
            Questions? Email{' '}
            <a className="text-[var(--dd-red)] underline underline-offset-4" href="mailto:dubbledecker@kishpatel.com">
              dubbledecker@kishpatel.com
            </a>
            .
          </p>
        </div>
      </article>
      <Footer />
    </main>
  )
}
