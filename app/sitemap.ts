import type { MetadataRoute } from 'next'
import { PATHS, SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

// Same URLs as each page's canonical (Next writes the homepage's without a trailing slash)
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}${PATHS.privacy}`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}${PATHS.licenses}`, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
