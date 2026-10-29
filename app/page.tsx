import type { Metadata } from 'next'
import { preload } from 'react-dom'
import { APP_STORE_URL } from '@/components/AppStoreButton'
import Experience from '@/components/Experience'
import { FEATURES } from '@/components/features'
import { HDR_URL, MODEL_URL } from '@/components/studio/assets.js'
import { PATHS, SITE_URL, description, pageMetadata, title } from '@/lib/site'

export const metadata: Metadata = pageMetadata({ title, description, path: PATHS.home })

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
  // the hero's downloads, started from the HTML rather than after the 3D engine boots;
  // crossOrigin matches three's loaders (fetch and <img crossorigin>) so the browser reuses them
  preload(MODEL_URL, { as: 'fetch', crossOrigin: 'anonymous', fetchPriority: 'high' })
  preload(HDR_URL, { as: 'fetch', crossOrigin: 'anonymous' })
  preload(FEATURES[0].screen, { as: 'image', crossOrigin: 'anonymous' })
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Experience />
    </main>
  )
}
