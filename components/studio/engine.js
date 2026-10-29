// The hero phone: a trimmed port of Phone Studio's renderer (../phone-studio/src/main.js).
// Same detailed model, studio lighting and tinted wall shadows, without the panel, layouts, cards or export.
import * as THREE from 'three'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js'
import { HorizontalBlurShader } from 'three/addons/shaders/HorizontalBlurShader.js'
import { VerticalBlurShader } from 'three/addons/shaders/VerticalBlurShader.js'
import { HDR_URL, MODEL_URL } from './assets.js'

const D2R = Math.PI / 180
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const wrap = v => ((v + 180) % 360 + 360) % 360 - 180
// CSS-style cubic-bezier(x1, y1, x2, y2): solve x(s) = t for s (Newton, then bisection), return y(s)
function cubicBezier(x1, y1, x2, y2) {
  const ax = 3 * x1 - 3 * x2 + 1, bx = 3 * x2 - 6 * x1, cx = 3 * x1
  const ay = 3 * y1 - 3 * y2 + 1, by = 3 * y2 - 6 * y1, cy = 3 * y1
  const x = s => ((ax * s + bx) * s + cx) * s, y = s => ((ay * s + by) * s + cy) * s
  const dx = s => (3 * ax * s + 2 * bx) * s + cx
  return t => {
    if (t <= 0) return 0
    if (t >= 1) return 1
    let s = t
    for (let i = 0; i < 8; i++) {
      const e = x(s) - t, d = dx(s)
      if (Math.abs(e) < 1e-6) return y(s)
      if (Math.abs(d) < 1e-6) break
      s -= e / d
    }
    let lo = 0, hi = 1; s = t
    for (let i = 0; i < 30; i++) { const e = x(s) - t; if (Math.abs(e) < 1e-6) break; if (e > 0) hi = s; else lo = s; s = (lo + hi) / 2 }
    return y(s)
  }
}
const turnEase = cubicBezier(0.2, 0.8, 0, 1)

const IMG_W = 1206, IMG_H = 2622

// back panel stays within ~5% lightness of the frame so it reads as one unibody
export const FINISHES = {
  ddred: { name: 'Red', c: '#CD1C25', back: '#D42A32', rough: 0.45 },
  ddblue: { name: 'Blue', c: '#0084FF', back: '#1B8FFF', rough: 0.45 },
  green: { name: 'Green', c: '#58A300', back: '#63AD0D', rough: 0.45 },
  orange: { name: 'Cosmic Orange', c: '#C8622B', back: '#CC6830', rough: 0.48 },
  blue: { name: 'Deep Blue', c: '#2D3A53', back: '#32405A', rough: 0.48 },
  silver: { name: 'Silver', c: '#DCDEE1', back: '#E1E3E5', rough: 0.4, dFrame: '#C6C8CB', dBack: '#EDEDEF', dRough: 0.45, dAntenna: '#B5B8BC' },
}

// Phone Studio's "Studio" lighting and default shadow settings
const L = { amb: 1.0, key: 1.2, lightAng: 0, rim: 2.5, rimAng: 70, exposure: 1.0, glare: 8 }
const SH_ = { lift: 40, str: 62, soft: 7, dist: 55, contact: 75 }
const EXT = [78, 164]

// =====================================================================
// Canvas-made textures
// =====================================================================
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t
}
function rrPath(x, y, w, h, r, ctx) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r) }

// =====================================================================
// Geometry helpers: Apple-style continuous ("squircle") corners
// =====================================================================
function sqShape(w, h, e) {
  const ex = Array.isArray(e) ? e : [e, e, e, e], n = 5, seg = 28, pts = []
  const sx = [1, -1, -1, 1], sy = [1, 1, -1, -1]
  for (let q = 0; q < 4; q++) {
    const R = Math.min(ex[q], w / 2, h / 2), cx = sx[q] * (w / 2 - R), cy = sy[q] * (h / 2 - R)
    for (let i = 0; i <= seg; i++) {
      const t = q * Math.PI / 2 + (i / seg) * Math.PI / 2, c = Math.cos(t), s = Math.sin(t)
      pts.push(new THREE.Vector2(cx + R * Math.sign(c) * Math.pow(Math.abs(c), 2 / n), cy + R * Math.sign(s) * Math.pow(Math.abs(s), 2 / n)))
    }
  }
  return new THREE.Shape(pts)
}
const shrinkE = (e, by) => Array.isArray(e) ? e.map(v => Math.max(v - by, 0.3)) : Math.max(e - by, 0.3)
function normUV(g, w, h) { const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + w / 2) / w, (p.getY(i) + h / 2) / h); uv.needsUpdate = true; return g }
const flat = (w, h, e) => normUV(new THREE.ShapeGeometry(sqShape(w, h, e)), w, h)
function slab(w, h, e, depth, bt, bs = bt, segs = 8) {
  const g = new THREE.ExtrudeGeometry(sqShape(w - 2 * bs, h - 2 * bs, shrinkE(e, bs)), { depth, bevelEnabled: true, bevelThickness: bt, bevelSize: bs, bevelSegments: segs })
  g.translate(0, 0, -depth / 2); g.computeVertexNormals(); return g
}
function ringGeo(wo, ho, eo, wi, hi, ei) {
  const s = sqShape(wo, ho, eo); s.holes.push(new THREE.Path(sqShape(wi, hi, ei).getPoints()))
  return new THREE.ShapeGeometry(s)
}
function planarUV(geom) {
  geom.computeBoundingBox(); const b = geom.boundingBox, p = geom.attributes.position
  const uv = new Float32Array(p.count * 2), w = b.max.x - b.min.x, h = b.max.y - b.min.y
  for (let i = 0; i < p.count; i++) { uv[2 * i] = (p.getX(i) - b.min.x) / w; uv[2 * i + 1] = (p.getY(i) - b.min.y) / h }
  geom.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return geom
}

// iPhone Pro Max proportions (mm)
const PW = 78.0, PH = 163.4, PD = 8.75, BEV = 2.4, E_BODY = 16.4
const GW = PW - 1.7, GH = PH - 1.7, E_GLASS = 15.6
const ZG = PD / 2 + 0.42
const SW = 72.8, SH = SW * IMG_H / IMG_W, E_SCREEN = 13.8

// Detailed model: "Apple iPhone 18 Pro Max" by AakashMansukhani on Sketchfab.
// Units are metres, origin at the bottom centre, screen facing +Z.
const DETAILED = {
  scale: 1000, screen: 'Front_Screen', glass: 'Front_Panel',
  // the simulator screenshots already include the Dynamic Island, so the model's own is hidden
  hide: ['Front_Sensor', 'Front_Cam_Lens', 'Front_Cam_Glass', 'Front_Cam_Inset', 'Front_Cam_Base'],
  finish: /^COLOUR_/, frameMat: 'COLOUR_Cherry_Side_Panel',
}

export function createStudio(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = L.exposure
  renderer.setClearColor(0x000000, 0)
  const scene = new THREE.Scene()
  const cam = new THREE.PerspectiveCamera(24, 1, 1, 5000)
  cam.layers.enable(2)
  const fsq = new FullScreenQuad()

  // ---- textures
  const SOFT_TEX = canvasTex(256, 256, (x, w, h) => {
    x.shadowColor = '#fff'; x.shadowBlur = 36; x.fillStyle = '#fff'; rrPath(44, 44, w - 88, h - 88, 30, x); x.fill(); x.fill()
  })
  const GRAIN_TEX = canvasTex(256, 256, (x, w, h) => {
    const id = x.createImageData(w, h)
    for (let i = 0; i < id.data.length; i += 4) { const v = 175 + Math.random() * 30; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255 }
    x.putImageData(id, 0, 0)
  }, false)
  GRAIN_TEX.wrapS = GRAIN_TEX.wrapT = THREE.RepeatWrapping; GRAIN_TEX.repeat.set(0.16, 0.16)
  const FILL_TEX = canvasTex(256, 256, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.55, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = g; x.fillRect(0, 0, w, h)
    const s = x.createLinearGradient(0, 0, w, 0); s.addColorStop(0, 'rgba(0,0,0,1)'); s.addColorStop(0.18, 'rgba(0,0,0,0)'); s.addColorStop(0.82, 'rgba(0,0,0,0)'); s.addColorStop(1, 'rgba(0,0,0,1)')
    x.globalCompositeOperation = 'destination-out'; x.fillStyle = s; x.fillRect(0, 0, w, h)
  })
  const SHEEN_TEX = canvasTex(256, 512, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, w * 0.9, h * 0.55)
    g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.38, 'rgba(255,255,255,0.35)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = g; x.fillRect(0, 0, w, h)
  })

  // ---- materials
  const MAT = {
    body: new THREE.MeshPhysicalMaterial({ metalness: 1, roughness: 0.48, roughnessMap: GRAIN_TEX, bumpMap: GRAIN_TEX, bumpScale: 0.006 }),
    lip: new THREE.MeshPhysicalMaterial({ metalness: 1, roughness: 0.12 }),
    antenna: new THREE.MeshPhysicalMaterial({ metalness: 0.1, roughness: 0.6 }),
    back: new THREE.MeshPhysicalMaterial({ metalness: 0.1, roughness: 0.75, clearcoat: 0.05, clearcoatRoughness: 0.6 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x030304, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02, ior: 1.52, specularIntensity: 0.4, envMapIntensity: 0.35 }),
    glare: new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: L.glare / 100 }),
    sheen: new THREE.MeshBasicMaterial({ map: SHEEN_TEX, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, opacity: L.glare / 100 * 0.2 }),
    lensRing: new THREE.MeshPhysicalMaterial({ metalness: 1, roughness: 0.28 }),
    chamfer: new THREE.MeshPhysicalMaterial({ metalness: 1, roughness: 0.3 }),
    seam: new THREE.MeshPhysicalMaterial({ metalness: 0.6, roughness: 0.5 }),
    lensGlass: new THREE.MeshPhysicalMaterial({ color: 0x020203, roughness: 0.05, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.02 }),
    lensCore: new THREE.MeshPhysicalMaterial({ color: 0x050505, roughness: 0.05, metalness: 0.5, clearcoat: 1, sheen: 0.4, sheenColor: new THREE.Color(0x3a3aa0), sheenRoughness: 0.3 }),
    dark: new THREE.MeshPhysicalMaterial({ color: 0x08080a, roughness: 0.45, metalness: 0.3 }),
    port: new THREE.MeshBasicMaterial({ color: 0x050506 }),
    flash: new THREE.MeshPhysicalMaterial({ color: 0xcfc8b8, roughness: 0.55, clearcoat: 0.6 }),
    sapphire: new THREE.MeshPhysicalMaterial({ color: 0x16171a, roughness: 0.18, metalness: 0.4, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 0.3 }),
  }
  const screenMat = new THREE.MeshBasicMaterial({ toneMapped: false, color: 0x000000 })

  // ---- simple procedural phone: shown until the detailed model loads, and kept if it can't
  const root = new THREE.Group(), proc = new THREE.Group(); root.add(proc)
  const add = (g, m, pos = [0, 0, 0], rot = [0, 0, 0], cast = true, parent = proc) => {
    const mesh = new THREE.Mesh(g, m); mesh.position.set(...pos); mesh.rotation.set(...rot)
    if (cast) mesh.layers.enable(1); parent.add(mesh); return mesh
  }
  const body = add(slab(PW, PH, E_BODY, PD - 2 * BEV, BEV, BEV, 14), MAT.body)
  add(slab(GW, GH, E_GLASS, 0.12, 0.45, 0.9, 10), MAT.glass, [0, 0, ZG - 0.51])
  add(ringGeo(GW + 0.5, GH + 0.5, E_GLASS + 0.25, GW - 0.2, GH - 0.2, E_GLASS - 0.1), MAT.lip, [0, 0, PD / 2 - 0.65], [0, 0, 0], false)
  const procScreen = add(flat(SW, SH, E_SCREEN), screenMat, [0, 0, ZG + 0.01], [0, 0, 0], false)
  const procGlare = add(flat(GW - 1.2, GH - 1.2, E_GLASS - 0.6), MAT.glare, [0, 0, ZG + 0.03], [0, 0, 0], false); procGlare.renderOrder = 3
  const procSheen = add(flat(GW - 1.2, GH - 1.2, E_GLASS - 0.6), MAT.sheen, [0, 0, ZG + 0.035], [0, 0, 0], false); procSheen.renderOrder = 4
  {
    const plH = 38, plTop = PH / 2 - 0.03, plY = plTop - plH / 2
    const panelTop = plTop - plH - 3, panelBot = -PH / 2 + 3.2, panelH = panelTop - panelBot, panelY = (panelTop + panelBot) / 2
    add(flat(PW - 5.2, panelH + 0.4, 12.2), MAT.seam, [0, panelY, -PD / 2 - 0.012], [0, Math.PI, 0], false)
    add(flat(PW - 5.6, panelH, 12), MAT.back, [0, panelY, -PD / 2 - 0.02], [0, Math.PI, 0], false)
    const plFront = -PD / 2 + 3.2, plBack = -PD / 2 - 1.6, plBev = 0.7
    add(slab(PW - 0.06, plH, [E_BODY, E_BODY, 1.6, 1.6], (plFront - plBack) - 2 * plBev, plBev, plBev, 8), MAT.body, [0, plY, (plFront + plBack) / 2])
    const lens = (x, y, r) => {
      add(new THREE.CylinderGeometry(r + 1.1, r + 1.1, 1.8, 64), MAT.lensRing, [x, y, plBack - 0.9], [Math.PI / 2, 0, 0])
      add(new THREE.RingGeometry(r + 0.05, r + 0.28, 64), MAT.chamfer, [x, y, plBack - 1.805], [0, Math.PI, 0], false)
      add(new THREE.CircleGeometry(r, 64), MAT.lensGlass, [x, y, plBack - 1.81], [0, Math.PI, 0], false)
      add(new THREE.CircleGeometry(r * 0.52, 64), MAT.lensCore, [x, y, plBack - 1.82], [0, Math.PI, 0], false)
    }
    const ly = plY - 1
    lens(24.4, ly + 8.6, 6.3); lens(24.4, ly - 8.6, 6.3); lens(11.0, ly, 6.3)
    add(new THREE.CircleGeometry(2.3, 48), MAT.flash, [-24.5, ly + 7.5, plBack - 0.02], [0, Math.PI, 0], false)
    add(new THREE.CircleGeometry(2.6, 48), MAT.dark, [-24.5, ly - 7.5, plBack - 0.02], [0, Math.PI, 0], false)
    const btn = (x, y, len, mat = MAT.body, w = 1.0, d = 2.3) => add(slab(d, len, Math.min(d, len) / 2, Math.max(w - 0.3, 0.05), 0.15, 0.15, 4), mat, [x, y, 0], [0, Math.PI / 2, 0])
    btn(-PW / 2 - 0.3, 56, 6.6); btn(-PW / 2 - 0.3, 41.5, 12.5); btn(-PW / 2 - 0.3, 25.5, 12.5)
    btn(PW / 2 + 0.3, 41, 17.5)
    btn(PW / 2 + 0.04, -14, 17.8, MAT.lensRing, 0.36, 3.8)
    btn(PW / 2 + 0.12, -14, 17.0, MAT.sapphire, 0.36, 3.0)
    const wallD = PD - 2 * BEV
    for (const sx of [-1, 1]) for (const y of [PH / 2 - 20, -PH / 2 + 20])
      add(new THREE.PlaneGeometry(wallD + 0.6, 0.6), MAT.antenna, [sx * (PW / 2 + 0.01), y, 0], [0, sx * Math.PI / 2, 0], false)
    add(flat(8.9, 3.2, 1.6), MAT.port, [0, -PH / 2 - 0.012, 0], [Math.PI / 2, 0, 0], false)
  }

  const rig = new THREE.Group(); rig.rotation.order = 'YXZ'; rig.add(root); scene.add(rig)
  let detailed = null, finishMats = [], shadowCaster = body

  // ---- finish
  let finish = FINISHES.ddred
  const _lin = new THREE.Color()
  const lum = c => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b
  function applyFinish() {
    const f = finish, c = new THREE.Color(f.c)
    MAT.body.color.copy(c); MAT.body.roughness = f.rough
    MAT.back.color.set(f.back)
    MAT.lip.color.copy(c).lerp(new THREE.Color('#ffffff'), 0.25)
    MAT.lensRing.color.copy(c).multiplyScalar(0.55)
    MAT.chamfer.color.copy(c).lerp(new THREE.Color('#ffffff'), 0.3)
    MAT.seam.color.copy(c).multiplyScalar(0.55)
    MAT.antenna.color.copy(c).offsetHSL(0, -0.05, -0.06)
    // detailed model: keep each part's lightness relative to the frame
    const target = _lin.set(f.dFrame || f.c)
    finishMats.forEach(x => {
      const n = x.mat.name
      if (/Backpanel/i.test(n)) { x.mat.color.set(f.dBack || f.back); x.mat.opacity = 1; x.mat.roughness = 0.6; return }
      if (/Antenna/i.test(n) && f.dAntenna) { x.mat.color.set(f.dAntenna); return }
      if (/Side_Panel$/i.test(n)) x.mat.roughness = f.dRough ?? x.origRough
      x.mat.color.copy(target).multiplyScalar(clamp(x.ratio, 0.05, 2.5))
    })
    touch()
  }

  function installDetailed(gltf) {
    gltf.scene.traverse(o => {
      if (!o.isMesh) return
      const n = o.material.name
      if (/Side_Button_Detail$/i.test(n)) { o.material.color.set('#1A1B1E'); o.material.roughness = 0.1; return }
      if (/Flash_Light|Flash_Ref_Gradient/i.test(n)) { o.material.color.set('#E4E4E2'); return }
      if (DETAILED.finish.test(n) && !finishMats.some(f => f.mat === o.material)) finishMats.push({ mat: o.material, orig: o.material.color.clone(), origRough: o.material.roughness })
    })
    const frame = finishMats.find(f => f.mat.name === DETAILED.frameMat)
    const frameLum = frame ? lum(frame.orig) : 0.07
    finishMats.forEach(f => f.ratio = lum(f.orig) / frameLum)

    const m = gltf.scene
    m.scale.setScalar(DETAILED.scale); m.updateMatrixWorld(true)
    const b = new THREE.Box3().setFromObject(m)
    m.position.set(-(b.min.x + b.max.x) / 2, -(b.min.y + b.max.y) / 2, 0)
    const holder = new THREE.Group(); holder.add(m)
    let screen = null, glass = null
    m.traverse(o => {
      if (DETAILED.hide.includes(o.name)) o.visible = false
      if (!o.isMesh) return
      o.layers.enable(1)
      if (o.name === DETAILED.screen) screen = o
      if (o.name === DETAILED.glass) glass = o
    })
    if (glass) { glass.material.envMapIntensity = 0.3; glass.material.clearcoatRoughness = 0.04 }
    if (screen) {
      // the screen mesh has holes for the model's camera; back them with black so the screenshot's island reads solid
      screen.geometry.computeBoundingBox(); const sb = screen.geometry.boundingBox
      const plug = new THREE.Mesh(new THREE.PlaneGeometry(0.0215, 0.0062), new THREE.MeshBasicMaterial({ color: 0x000000 }))
      plug.position.set((sb.min.x + sb.max.x) / 2, sb.max.y - 0.0056, sb.max.z + 0.000005); m.add(plug)
      screen.geometry = planarUV(screen.geometry.clone())
      screen.material = screenMat; screen.position.z += 0.00001
      screen.layers.disable(1)
      m.updateMatrixWorld(true); const zFront = new THREE.Box3().setFromObject(screen).max.z
      m.position.z += ZG - zFront
      const sb2 = new THREE.Box3().setFromObject(screen), sw = sb2.max.x - sb2.min.x, sh = sb2.max.y - sb2.min.y
      const g = flat(sw, sh, E_SCREEN)
      const glare = new THREE.Mesh(g, MAT.glare); glare.renderOrder = 3; glare.position.set(0, 0, ZG + 0.03)
      const sheen = new THREE.Mesh(g, MAT.sheen); sheen.renderOrder = 4; sheen.position.set(0, 0, ZG + 0.035)
      holder.add(glare, sheen)
    }
    root.add(holder); proc.visible = false
    detailed = holder; shadowCaster = holder
    applyFinish()
  }

  // ---- screens
  const texLoader = new THREE.TextureLoader()
  const texCache = {}
  function loadScreen(url) {
    return texCache[url] || (texCache[url] = new Promise((res, rej) => texLoader.load(url, t => {
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); res(t)
    }, undefined, e => { delete texCache[url]; rej(e) })))
  }
  // only the showing screen stays on the GPU (~8 MB each with mipmaps); a cached texture re-uploads when shown again
  function showTexture(tex) {
    const prev = screenMat.map
    screenMat.map = tex; screenMat.color.set(0xffffff); screenMat.needsUpdate = true; touch()
    if (prev && prev !== tex) prev.dispose()
  }

  // ---- lighting: HDRI studio + light shapes, baked into one environment
  const envScene = new THREE.Scene()
  const envSphere = new THREE.Mesh(new THREE.SphereGeometry(400, 64, 32), new THREE.MeshBasicMaterial({ side: THREE.BackSide, toneMapped: false, color: 0x202124 }))
  envSphere.scale.x = -1
  envScene.add(envSphere)
  const former = (w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: SOFT_TEX, transparent: true, side: THREE.DoubleSide, toneMapped: false, depthWrite: false })); envScene.add(m); return m }
  const keyFormer = former(150, 45), rimLF = former(24, 260), rimRF = former(24, 260), topFormer = former(160, 40)
  const fillFormer = new THREE.Mesh(new THREE.PlaneGeometry(380, 260), new THREE.MeshBasicMaterial({ map: FILL_TEX, transparent: true, side: THREE.DoubleSide, toneMapped: false, depthWrite: false }))
  envScene.add(fillFormer)
  let hdri = null
  const pmrem = new THREE.PMREMGenerator(renderer)
  let envRT = null, envDirty = true, envYaw = 0, lastEnvBuild = 0
  const key = new THREE.DirectionalLight(0xffffff, 1.6)
  scene.add(key, key.target)
  const keyDir = () => new THREE.Vector3(-0.5, 0.9, 0.7).normalize().applyAxisAngle(new THREE.Vector3(0, 0, 1), L.lightAng * D2R)
  function buildEnv(yaw) {
    envSphere.material.map = hdri; envSphere.material.needsUpdate = true
    envSphere.material.color.set('#FFFFFF').multiplyScalar(hdri ? L.amb : 0.12 * L.amb)
    const kd = keyDir()
    keyFormer.position.copy(kd).multiplyScalar(220); keyFormer.lookAt(0, 0, 0)
    keyFormer.material.color.setScalar(L.key * 3.2)
    topFormer.position.set(0, 230, -40); topFormer.lookAt(0, 0, 0); topFormer.material.color.setScalar(0.35 + L.key * 0.25)
    fillFormer.position.set(0, 90, 260); fillFormer.lookAt(0, 0, 0); fillFormer.material.color.setScalar(0.6 * L.key * 3.2 * Math.min(1, 0.35 + L.amb))
    // each rim strip sits where its rail mirrors the camera
    const R = 230, psi = Math.min(Math.abs(wrap(yaw)), 90), off = L.rimAng - 70; envYaw = yaw
    const near = clamp(2 * psi + off, 15, 88) * D2R, far = clamp(90 - 2 * psi + off, 15, 88) * D2R
    const leftNear = wrap(yaw) > 0, aL = leftNear ? near : far, aR = leftNear ? far : near
    rimLF.position.set(-R * Math.sin(aL), 60, -R * Math.cos(aL)); rimLF.lookAt(0, 0, 0)
    rimRF.position.set(R * Math.sin(aR), 60, -R * Math.cos(aR)); rimRF.lookAt(0, 0, 0)
    rimLF.material.color.setScalar(L.rim * 3); rimRF.material.color.setScalar(L.rim * 3)
    const rt = pmrem.fromScene(envScene, 0, 1, 1000)
    if (envRT) envRT.dispose(); envRT = rt; scene.environment = rt.texture
    key.position.copy(kd).multiplyScalar(400); key.intensity = L.key * 1.4
    envDirty = false
  }

  // ---- soft shadows on the wall behind the phone, tinted by the page background
  const depthMat = new THREE.ShaderMaterial({
    uniforms: { uFar: { value: 100 } },
    vertexShader: 'varying float vD; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vD = -mv.z; gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float uFar; varying float vD; void main(){ float d = clamp(vD/uFar, 0.0, 1.0); float a = pow(1.0 - d, 1.6); gl_FragColor = vec4(1.0, 1.0, 1.0, a); }',
    side: THREE.DoubleSide, blending: THREE.NoBlending,
  })
  const blurH = new THREE.ShaderMaterial({ uniforms: THREE.UniformsUtils.clone(HorizontalBlurShader.uniforms), vertexShader: HorizontalBlurShader.vertexShader, fragmentShader: HorizontalBlurShader.fragmentShader, depthTest: false })
  const blurV = new THREE.ShaderMaterial({ uniforms: THREE.UniformsUtils.clone(VerticalBlurShader.uniforms), vertexShader: VerticalBlurShader.vertexShader, fragmentShader: VerticalBlurShader.fragmentShader, depthTest: false })
  function makeShadowLayer(res) {
    const rt = new THREE.WebGLRenderTarget(res, res, { depthBuffer: true }), rtB = new THREE.WebGLRenderTarget(res, res, { depthBuffer: true })
    rt.texture.generateMipmaps = rtB.texture.generateMipmaps = false
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: rt.texture, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }))
    plane.layers.set(2); plane.renderOrder = -1; scene.add(plane)
    const camO = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 100); camO.layers.set(1)
    return { rt, rtB, plane, cam: camO, res }
  }
  const contactLayer = makeShadowLayer(1024), coreLayer = makeShadowLayer(512), castLayer = makeShadowLayer(512)
  const _box = new THREE.Box3(), _c = new THREE.Vector3(), _T = new THREE.Vector3(), _qi = new THREE.Quaternion(), _shear = new THREE.Matrix4()
  const FLIP = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
  const surface = new THREE.Object3D()
  const shadowCol = new THREE.Color(0, 0, 0), _hsl = {}
  const ramp = n => Array.from({ length: n }, (_, i) => 1 + i * 0.85)
  function blurPass(Lr, step) {
    blurH.uniforms.tDiffuse.value = Lr.rt.texture; blurH.uniforms.h.value = step / Lr.res
    renderer.setRenderTarget(Lr.rtB); fsq.material = blurH; fsq.render(renderer)
    blurV.uniforms.tDiffuse.value = Lr.rtB.texture; blurV.uniforms.v.value = step / Lr.res
    renderer.setRenderTarget(Lr.rt); fsq.material = blurV; fsq.render(renderer)
  }
  function renderShadowLayer(Lr, size, far, shear, steps, opacity) {
    Lr.plane.scale.set(-size, size, 1); Lr.plane.material.color.copy(shadowCol); Lr.plane.material.opacity = opacity
    const c = Lr.cam; c.left = -size / 2; c.right = size / 2; c.top = size / 2; c.bottom = -size / 2; c.near = 0; c.far = far
    c.position.copy(surface.position); c.quaternion.copy(surface.quaternion).multiply(FLIP)
    c.updateMatrixWorld(); c.updateProjectionMatrix()
    if (shear) {
      _T.copy(key.position).normalize().negate().applyQuaternion(_qi.copy(c.quaternion).invert())
      if (_T.z > 0.08) {
        let a = _T.x / _T.z, b = _T.y / _T.z; const len = Math.hypot(a, b), m = SH_.dist / 100 * 1.2
        if (len > 1e-4) { a = a / len * m; b = b / len * m }
        c.projectionMatrix.multiply(_shear.set(1, 0, -a, 0, 0, 1, -b, 0, 0, 0, 1, 0, 0, 0, 0, 1)); c.projectionMatrixInverse.copy(c.projectionMatrix).invert()
      }
    }
    depthMat.uniforms.uFar.value = far
    const env = scene.environment
    scene.environment = null; scene.overrideMaterial = depthMat
    renderer.setRenderTarget(Lr.rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, c)
    scene.overrideMaterial = null; scene.environment = env
    for (const s of steps) blurPass(Lr, s)
    renderer.setRenderTarget(null)
  }
  function updateShadows() {
    rig.updateMatrixWorld(true)
    _box.makeEmpty().expandByObject(shadowCaster)
    _box.getCenter(_c)
    const size = Math.max(EXT[0], EXT[1]) * 2.6
    surface.position.set(_c.x, _c.y, _box.min.z - SH_.lift)
    ;[contactLayer, coreLayer, castLayer].forEach((Lr, i) => Lr.plane.position.copy(surface.position).setZ(surface.position.z + 0.02 * (i + 1)))
    const str = SH_.str / 100
    renderShadowLayer(contactLayer, size, SH_.lift * 2.2 + 20, false, ramp(3 + Math.round(SH_.lift / 12)), SH_.contact / 100 * 0.8)
    renderShadowLayer(coreLayer, size, 200, true, ramp(3), str * 0.65)
    renderShadowLayer(castLayer, size, 300, true, ramp(Math.round(2 + SH_.soft * 1.1)), str)
  }

  // ---- pose: a resting angle, a gentle follow of the pointer, and a turn when the screen changes
  const BASE = { yaw: -14, pitch: 6, roll: 2, fov: 24, zoom: 100 }
  const target = { yaw: BASE.yaw, pitch: BASE.pitch }
  const cur = { yaw: BASE.yaw, pitch: BASE.pitch }
  let zoom = BASE.zoom, offsetY = 0
  const _up = new THREE.Vector3()

  // A full spin about the vertical axis on the eased curve, turning the other way each time.
  // The screen swaps halfway, while the back is to the camera.
  const TURN_MS = 850
  const NO_TURN = { yaw: 0 }
  let turn = null, dir = -1
  function startTurn(swap) {
    dir = -dir
    turn = { dir, start: performance.now(), swap, swapped: false, next: null }
    touch()
  }
  function turnOffset(now) {
    if (!turn) return NO_TURN
    const t = clamp((now - turn.start) / TURN_MS, 0, 1), p = turnEase(t)
    if (!turn.swapped && p >= 0.5) { turn.swapped = true; turn.swap() }
    if (t >= 1) {
      const next = turn.next; turn = null
      if (next) next()
      return NO_TURN
    }
    return { yaw: 360 * turn.dir * p }
  }
  function frameCamera(aspect, ex) {
    cam.fov = BASE.fov; cam.aspect = aspect
    const t = Math.tan(BASE.fov / 2 * D2R), k = 1.1 / (zoom / 100)
    const d = Math.max((EXT[1] / 2 * k) / t, (EXT[0] / 2 * 1.2 * k) / (t * aspect))
    cam.position.set(0, 0, d); cam.up.set(0, 1, 0); cam.lookAt(0, 0, 0)
    cam.near = Math.max(d - 320, d * 0.25); cam.far = d + 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld()
    _up.setFromMatrixColumn(cam.matrixWorld, 1)
    rig.position.set(0, 0, 0).addScaledVector(_up, offsetY / 100 * 2 * d * t)
    rig.rotation.set(cur.pitch * D2R, (cur.yaw + ex.yaw) * D2R, BASE.roll * D2R)
    rig.updateMatrixWorld(true)
  }

  // ---- accumulation: average jittered renders for clean edges once the phone is still
  const FS_VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }'
  const accMat = new THREE.ShaderMaterial({
    uniforms: { t: { value: null } }, vertexShader: FS_VERT, fragmentShader: 'uniform sampler2D t; varying vec2 vUv; void main(){ gl_FragColor = texture2D(t, vUv); }',
    transparent: true, depthTest: false, depthWrite: false, blending: THREE.CustomBlending,
    blendSrc: THREE.ConstantAlphaFactor, blendDst: THREE.OneMinusConstantAlphaFactor, blendSrcAlpha: THREE.ConstantAlphaFactor, blendDstAlpha: THREE.OneMinusConstantAlphaFactor,
  })
  const showMat = new THREE.ShaderMaterial({ uniforms: { t: { value: null } }, vertexShader: FS_VERT, fragmentShader: 'uniform sampler2D t; varying vec2 vUv; void main(){ gl_FragColor = texture2D(t, vUv); }', depthTest: false, depthWrite: false, blending: THREE.NoBlending })
  let accRT = null, fbTex = null
  const _db = new THREE.Vector2()
  function ensureAcc() {
    renderer.getDrawingBufferSize(_db); const w = _db.x, h = _db.y
    if (!accRT || accRT.width !== w || accRT.height !== h) {
      accRT?.dispose(); fbTex?.dispose()
      accRT = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, depthBuffer: false })
      fbTex = new THREE.FramebufferTexture(w, h)
    }
    return [w, h]
  }
  const halton = (i, b) => { let f = 1, r = 0; while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b) } return r }
  function jitter(k, w, h) {
    const e = cam.projectionMatrix.elements
    e[8] = 2 * (halton(k + 1, 2) - 0.5) / w; e[9] = 2 * (halton(k + 1, 3) - 0.5) / h
    cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert()
  }
  const SAMPLES = 16

  // ---- loop
  let accK = 0, lastChange = 0, raf = 0, last = performance.now(), frame = 0, visible = true, disposed = false
  let viewW = 1, viewH = 1
  function touch() { accK = 0; lastChange = performance.now() }
  function resize() {
    const r = canvas.parentElement.getBoundingClientRect()
    viewW = Math.max(1, Math.round(r.width)); viewH = Math.max(1, Math.round(r.height))
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(viewW, viewH, false)
    touch()
  }
  const ro = new ResizeObserver(resize); ro.observe(canvas.parentElement); resize()

  function tick(now) {
    raf = requestAnimationFrame(tick)
    if (!visible) return
    const dt = Math.min((now - last) / 1000, 0.05); last = now
    const ex = turnOffset(now)
    let moving = !!turn
    const a = 1 - Math.pow(0.0006, dt)
    for (const k of ['yaw', 'pitch']) {
      const diff = target[k] - cur[k]
      if (Math.abs(diff) > 0.01) { moving = true; cur[k] += diff * a } else cur[k] = target[k]
    }
    if (moving) touch()
    const yaw = cur.yaw + ex.yaw
    if (Math.abs(wrap(yaw - envYaw)) > (turn ? 15 : 4)) envDirty = true
    if (envDirty && now - lastEnvBuild > 90) { buildEnv(yaw); lastEnvBuild = now; touch() }
    const settled = !moving && now - lastChange > 120
    const [w, h] = ensureAcc()
    if (!settled) {
      frameCamera(viewW / viewH, ex)
      if ((frame++ & 1) === 0) updateShadows()
      renderer.setRenderTarget(null); renderer.render(scene, cam)
      return
    }
    if (accK >= SAMPLES) return
    if (accK === 0) { frameCamera(viewW / viewH, NO_TURN); updateShadows() }
    for (let i = 0; i < 2 && accK < SAMPLES; i++, accK++) {
      frameCamera(viewW / viewH, NO_TURN); jitter(accK, w, h)
      renderer.setRenderTarget(null); renderer.render(scene, cam)
      renderer.copyFramebufferToTexture(fbTex)
      const ac = renderer.autoClear; renderer.autoClear = false
      renderer.setRenderTarget(accRT)
      if (accK === 0) { renderer.setClearColor(0x000000, 0); renderer.clear() }
      accMat.blendAlpha = 1 / (accK + 1); accMat.uniforms.t.value = fbTex; fsq.material = accMat; fsq.render(renderer)
      renderer.setRenderTarget(null); renderer.autoClear = ac
    }
    showMat.uniforms.t.value = accRT.texture
    renderer.setRenderTarget(null); fsq.material = showMat; fsq.render(renderer)
  }

  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) touch() })
  io.observe(canvas)

  // ---- boot
  applyFinish()
  ;(async () => {
    try {
      const buf = await (await fetch(HDR_URL)).arrayBuffer()
      const d = new RGBELoader().parse(buf)
      const t = new THREE.DataTexture(d.data, d.width, d.height, THREE.RGBAFormat, d.type)
      t.colorSpace = THREE.LinearSRGBColorSpace; t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.flipY = true; t.needsUpdate = true
      if (!disposed) { hdri = t; envDirty = true; touch() }
    } catch { /* the light shapes alone still light the phone */ }
  })()
  const modelReady = new GLTFLoader().loadAsync(MODEL_URL)
    .then(g => { if (!disposed) installDetailed(g) })
    .catch(() => { /* keep the simple phone */ })
  raf = requestAnimationFrame(tick)

  let screenUrl = null, screenReq = 0
  return {
    ready: modelReady,
    // A finish passed here changes with the screen, while the back is to the camera.
    // Resolves false (and forgets the url, so it can be retried) if the image doesn't load.
    /** @param {string} url @param {{ animate?: boolean, finish?: string }} [opts] */
    async setScreen(url, { animate = true, finish: finishId } = {}) {
      if (url === screenUrl) return true
      screenUrl = url
      const token = ++screenReq
      let tex
      try { tex = await loadScreen(url) } catch {
        if (token === screenReq) screenUrl = null
        return false
      }
      if (token !== screenReq || disposed) return false
      const swap = () => { if (finishId) { finish = FINISHES[finishId] || FINISHES.ddred; applyFinish() } showTexture(tex) }
      if (!animate || !screenMat.map) { turn = null; swap(); return true }
      // mid-turn: before the swap, retarget it; after, queue another turn so the screen never changes face-on
      if (turn && !turn.swapped) turn.swap = swap
      else if (turn) turn.next = () => startTurn(swap)
      else startTurn(swap)
      return true
    },
    setFinish(id) { finish = FINISHES[id] || FINISHES.ddred; applyFinish() },
    // shadow tint from the page background, as in Phone Studio's "Tint shadow"
    setBackground(hex) {
      shadowCol.set(hex).getHSL(_hsl)
      shadowCol.setHSL(_hsl.h, Math.min(1, _hsl.s * 1.35), _hsl.l * (_hsl.s > 0.6 ? 0.3 : 0.4))
      touch()
    },
    // -1..1 in each axis
    setPointer(x, y) { target.yaw = BASE.yaw + x * 12; target.pitch = BASE.pitch - y * 7 },
    setFraming({ zoom: z = BASE.zoom, offsetY: oy = 0 } = {}) { zoom = z; offsetY = oy; touch() },
    dispose() {
      disposed = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect()
      envRT?.dispose(); accRT?.dispose(); fbTex?.dispose(); pmrem.dispose(); renderer.dispose()
    },
  }
}
