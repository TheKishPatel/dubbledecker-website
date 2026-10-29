import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

// The static export writes pages as .html, and the footer links to them that way
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/privacy.html`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/licenses.html`, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
