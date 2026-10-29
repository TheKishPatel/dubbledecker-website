import type { NextConfig } from 'next'

// Exported as a plain static site (`out/`), so it can be hosted anywhere.
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
}

export default nextConfig
