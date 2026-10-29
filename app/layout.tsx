import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { Press_Start_2P } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press-start',
})

// The app's own wordmark face.
const pacifico = localFont({
  src: './Pacifico-Regular.ttf',
  variable: '--font-pacifico',
})

const title = 'Dubbledecker — Live London bus times for iPhone'
const description =
  'Live arrivals for every bus stop and river pier in London. Saved stops, home screen widgets, route maps and timetables. Free on the App Store.'

export const metadata: Metadata = {
  metadataBase: new URL('https://dubbledecker.com'),
  title,
  description,
  icons: { icon: '/app-icon.png', apple: '/app-icon.png' },
  itunes: { appId: '806904237' },
  openGraph: {
    title,
    description,
    url: 'https://dubbledecker.com',
    siteName: 'Dubbledecker',
    images: [{ url: '/og.jpg', width: 1200, height: 630 }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/og.jpg'] },
}

export const viewport: Viewport = {
  themeColor: '#CC1C25',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className={`${GeistSans.variable} ${pacifico.variable} ${pressStart2P.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
