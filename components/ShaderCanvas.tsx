'use client'

import { Dithering } from '@paper-design/shaders-react'

export default function ShaderCanvas() {
  return (
    <div className="absolute inset-0" style={{ backgroundColor: '#FF0005' }}>
      {/* Blue layer */}
      <Dithering
        speed={0.4}
        shape="simplex"
        type="8x8"
        size={0.5}
        scale={1}
        colorBack="#00000000"
        colorFront="#1800FF"
        style={{ position: 'absolute', inset: 0 }}
      />
      {/* Yellow-green layer */}
      <Dithering
        speed={0.4}
        shape="simplex"
        type="8x8"
        size={0.5}
        scale={0.65}
        colorBack="#00000000"
        colorFront="#C3FF00"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          rotate: '180deg',
          transformOrigin: '50% 50%',
        }}
      />
      {/* Red-orange layer */}
      <Dithering
        speed={0.4}
        shape="simplex"
        type="8x8"
        size={0.5}
        scale={0.36}
        colorBack="#00000000"
        colorFront="#F95142"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          rotate: '180deg',
          transformOrigin: '50% 50%',
        }}
      />
    </div>
  )
}
