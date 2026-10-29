import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

// The social preview, built once at export as /og.png (a route rather than opengraph-image.tsx,
// which exports without a file extension and so gets the wrong content type on static hosts).
// The phone is a Phone Studio render (Hero pose, DD Red on #CC1C25, wide, cropped to 1.91:1).

export const dynamic = 'force-static'

const size = { width: 1200, height: 630 }

export async function GET() {
  const root = process.cwd()
  const [phone, pacifico, geist] = await Promise.all([
    readFile(join(root, 'app/og-phone.jpg')),
    readFile(join(root, 'app/Pacifico-Regular.ttf')),
    readFile(join(root, 'node_modules/geist/dist/fonts/geist-sans/Geist-Medium.ttf')),
  ])

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#CC1C25' }}>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img
          src={`data:image/jpeg;base64,${phone.toString('base64')}`}
          width={1200}
          height={630}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 76,
            width: 560,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'Geist',
          }}
        >
          <div style={{ fontFamily: 'Pacifico', fontSize: 50, lineHeight: 1.4 }}>Dubbledecker</div>
          <div style={{ fontSize: 68, lineHeight: 1.02, letterSpacing: -2.5, marginTop: 22 }}>
            Real time London bus arrivals
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 27, lineHeight: 1.3, opacity: 0.82, marginTop: 26 }}>
            <div>Buses, trams and river buses.</div>
            <div>Free on the App Store.</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Pacifico', data: pacifico, weight: 400, style: 'normal' },
        { name: 'Geist', data: geist, weight: 500, style: 'normal' },
      ],
    },
  )
}
