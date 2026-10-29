import type { MetadataRoute } from 'next'
import { description } from '@/lib/site'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dubbledecker',
    short_name: 'Dubbledecker',
    description,
    start_url: '/',
    display: 'browser',
    background_color: '#CC1C25',
    theme_color: '#CC1C25',
    icons: [
      { src: '/app-icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/app-icon.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
