import type { Metadata } from 'next'
import { APP_STORE_URL } from '@/components/AppStoreButton'
import Experience from '@/components/Experience'
import { FEATURES } from '@/components/features'
import { SITE_URL, description } from '@/lib/site'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

// App details for Google (schema.org MobileApplication)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: 'Dubbledecker',
  description,
  url: SITE_URL,
  image: `${SITE_URL}/app-icon.png`,
  operatingSystem: 'iOS',
  applicationCategory: 'TravelApplication',
  installUrl: APP_STORE_URL,
  screenshot: FEATURES.map(f => `${SITE_URL}${f.screen}`),
  featureList: FEATURES.map(f => f.title),
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
  publisher: { '@type': 'Organization', name: 'Very Nice Software Limited', url: 'https://verynicesoftware.com' },
}

export default function Home() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Experience />
    </main>
  )
}
