import type { Metadata } from 'next'

// Shared by the page metadata, the manifest, the sitemap and robots.txt
export const SITE_URL = 'https://dubbledecker.com'
export const title = 'Dubbledecker — Real time London bus times for iPhone'
export const description =
  'Real time arrivals for every London bus stop, Croydon tram stop and river bus pier. Saved stops, route maps, widgets and dark mode. Free for iPhone.'

// The static export writes pages as .html files. Keep these URLs: shipped app builds link to
// /licenses.html from the Info screen, and the privacy policy URL may be registered elsewhere.
export const PATHS = { home: '/', privacy: '/privacy.html', licenses: '/licenses.html' } as const

const OG_IMAGE = { url: '/og.png', width: 1200, height: 630, alt: 'Dubbledecker: real time London bus arrivals for iPhone' }

// A page's own description, canonical and social card. Next replaces openGraph wholesale
// rather than merging it, so every page sets all of it.
export function pageMetadata(page: { title: string; description: string; path: string }): Metadata {
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      title: page.title,
      description: page.description,
      url: page.path,
      siteName: 'Dubbledecker',
      locale: 'en_GB',
      type: 'website',
      images: [OG_IMAGE],
    },
    twitter: { card: 'summary_large_image', title: page.title, description: page.description, images: [OG_IMAGE.url] },
  }
}
