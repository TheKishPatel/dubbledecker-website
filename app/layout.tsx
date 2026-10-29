import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import localFont from 'next/font/local'
import { PATHS, SITE_URL, description, pageMetadata, title } from '@/lib/site'
import './globals.css'

// The app's own wordmark face.
const pacifico = localFont({
  src: './Pacifico-Regular.ttf',
  variable: '--font-pacifico',
})

// Icons (favicon.ico, icon.png, apple-icon.png) come from app/ file conventions; the OG image is app/og.png/route.tsx.
// Each page sets its own title, description, canonical and social card with pageMetadata(); these are the
// fallbacks (for the 404 page), without a canonical so nothing inherits the homepage's.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata({ title, description, path: PATHS.home }),
  alternates: undefined,
  applicationName: 'Dubbledecker',
  keywords: ['London bus times', 'live bus arrivals', 'TfL bus app', 'Croydon trams', 'river bus', 'Thames Clippers', 'bus stop widget', 'iPhone'],
  category: 'travel',
  creator: 'Very Nice Software Limited',
  publisher: 'Very Nice Software Limited',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  formatDetection: { telephone: false, address: false, email: false },
  itunes: { appId: '806904237' },
}

export const viewport: Viewport = {
  themeColor: '#CC1C25',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className={`${GeistSans.variable} ${pacifico.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
