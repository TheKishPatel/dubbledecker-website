import type { NextConfig } from 'next'

// Exported as a plain static site (`out/`), so it can be hosted anywhere.
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // The export writes privacy.html and licenses.html, and the site links to them that way;
  // `next dev` serves /privacy, so map the .html URLs there while developing.
  ...(process.env.NODE_ENV === 'development' && {
    async rewrites() {
      return [{ source: '/:page(privacy|licenses).html', destination: '/:page' }]
    },
  }),
}

export default nextConfig
