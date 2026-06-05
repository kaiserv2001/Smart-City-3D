import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScene } from '../SceneContext'
import { seededRand, generateBuildings } from '../cityData'

// 0=glass  1=concrete  2=corporate  3=brick  4=residential
const TYPES      = ['glass', 'concrete', 'corporate', 'brick', 'residential']
const N_VARIANTS = 5

const TYPE_CFG = {
  glass:       { floors: 16, cols: 6, metalness: 0.18, roughness: 0.08, warm: false },
  concrete:    { floors: 13, cols: 4, metalness: 0.02, roughness: 0.94, warm: true  },
  corporate:   { floors: 14, cols: 4, metalness: 0.05, roughness: 0.80, warm: true  },
  brick:       { floors: 10, cols: 3, metalness: 0.00, roughness: 0.96, warm: true  },
  residential: { floors:  9, cols: 3, metalness: 0.00, roughness: 0.92, warm: true  },
}

const PALETTES = {
  glass:       ['#4a7282','#3d6855','#7a6838','#404e5c','#2e7088','#5a6858','#68788e'],
  concrete:    ['#7c7870','#6c6c74','#787874','#6a7278','#747068','#808080','#6e7870'],
  corporate:   ['#9a8c78','#8898a0','#c0b4a4','#7880a0','#a8a098','#88948c','#9c9088'],
  brick:       ['#8c4030','#a05840','#c07050','#784030','#9c6848','#b07050','#944840'],
  residential: ['#5070b8','#b87840','#407850','#3888a0','#c06858','#887040','#9060a8'],
}

// Per-type night window glow colours
const NIGHT_GLOW = {
  glass: '#cce8ff', concrete: '#fff0e0', corporate: '#fff8cc',
  brick: '#ffe8aa', residential: '#faf0cc',
}

function createFacadeTextures(seed, floors, cols, type) {
  const W = 256, H = 512
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const dc = c.getContext('2d')
  const sr = s => { const x = Math.sin(s + 1) * 43758.5453; return x - Math.floor(x) }

  const pal  = PALETTES[type] || PALETTES.corporate
  const base = pal[Math.floor(sr(seed) * pal.length)]
  dc.fillStyle = base
  dc.fillRect(0, 0, W, H)

  const fH   = H / floors
  const colW = W / cols

  if (type === 'glass') {
    // Curtain wall — spandrel bands + mullions + sky-gradient windows
    dc.fillStyle = 'rgba(0,0,0,0.28)'
    for (let f = 0; f <= floors; f++) dc.fillRect(0, f * fH - 2, W, 4)
    dc.fillStyle = 'rgba(255,255,255,0.18)'
    for (let col = 0; col <= cols; col++) dc.fillRect(col * colW - 1, 0, 2, H)

    const TINTS = [
      ['rgba(160,215,245,0.90)','rgba(95,170,215,0.74)','rgba(55,118,168,0.58)'],
      ['rgba(140,218,182,0.86)','rgba(88,170,138,0.70)','rgba(48,118,98,0.55)'],
      ['rgba(218,192,132,0.84)','rgba(176,148,88,0.68)','rgba(124,98,52,0.52)'],
      ['rgba(188,198,218,0.82)','rgba(145,158,188,0.66)','rgba(105,118,152,0.52)'],
      ['rgba(108,202,232,0.90)','rgba(64,158,202,0.74)','rgba(36,110,162,0.58)'],
      ['rgba(165,218,168,0.86)','rgba(112,175,118,0.68)','rgba(68,126,78,0.54)'],
    ]
    const tint = TINTS[Math.floor(sr(seed * 3) * TINTS.length)]
    const wW = colW * 0.88, wH = fH * 0.84, pY = fH * 0.08

    for (let f = 0; f < floors; f++) {
      for (let col = 0; col < cols; col++) {
        const x = col * colW + (colW - wW) / 2, y = f * fH + pY
        const g = dc.createLinearGradient(x, y, x, y + wH)
        g.addColorStop(0, tint[0]); g.addColorStop(0.45, tint[1]); g.addColorStop(1, tint[2])
        dc.fillStyle = g; dc.fillRect(x, y, wW, wH)
        dc.fillStyle = 'rgba(255,255,255,0.22)'
        dc.fillRect(x + 3, y + 3, wW * 0.22, wH * 0.14)
      }
    }

  } else if (type === 'concrete') {
    // Precast panels — horizontal reveals + punched windows
    dc.fillStyle = 'rgba(0,0,0,0.2)'
    for (let f = 0; f <= floors; f++) dc.fillRect(0, f * fH - 1, W, 2)
    dc.fillStyle = 'rgba(0,0,0,0.1)'
    for (let col = 1; col < cols; col++) dc.fillRect(col * colW - 1, 0, 2, H)
    // Subtle surface variation
    for (let i = 0; i < 8; i++) {
      const alpha = (sr(seed * 13 + i) - 0.5) * 0.1
      dc.fillStyle = alpha > 0 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${-alpha})`
      dc.fillRect(sr(seed * 11 + i) * W, sr(seed * 17 + i) * H, sr(seed * 19 + i) * 70 + 20, sr(seed * 23 + i) * 90 + 30)
    }
    const wW = colW * 0.52, wH = fH * 0.44, pY = fH * 0.28
    for (let f = 0; f < floors; f++) {
      for (let col = 0; col < cols; col++) {
        const x = col * colW + (colW - wW) / 2, y = f * fH + pY
        dc.fillStyle = 'rgba(0,0,0,0.55)'; dc.fillRect(x - 2, y - 2, wW + 4, wH + 4)
        dc.fillStyle = sr(seed * 7 + f * 31 + col * 17) > 0.30 ? '#3a4858' : '#20292e'
        dc.fillRect(x, y, wW, wH)
      }
    }

  } else if (type === 'corporate') {
    // Stone/masonry — column piers + ornamental bands + elegant windows
    dc.fillStyle = 'rgba(255,255,255,0.07)'
    for (let f = 0; f <= floors; f++) dc.fillRect(0, f * fH - 1, W, 1)
    dc.fillStyle = 'rgba(0,0,0,0.18)'
    for (let col = 0; col <= cols; col++) dc.fillRect(col * colW - 3, 0, 6, H)
    // Base and crown accents
    dc.fillStyle = 'rgba(0,0,0,0.2)';   dc.fillRect(0, H - fH * 1.4, W, fH * 1.4)
    dc.fillStyle = 'rgba(255,255,255,0.1)'; dc.fillRect(0, 0, W, fH * 0.7)

    const wW = colW * 0.60, wH = fH * 0.62, pY = fH * 0.19
    for (let f = 0; f < floors; f++) {
      for (let col = 0; col < cols; col++) {
        const x = col * colW + (colW - wW) / 2, y = f * fH + pY
        dc.fillStyle = sr(seed * 7 + f * 31 + col * 17) > 0.28 ? '#4a5868' : '#2a3440'
        dc.fillRect(x, y, wW, wH)
        dc.fillStyle = 'rgba(200,180,155,0.50)'
        dc.fillRect(x, y, wW, 1); dc.fillRect(x, y, 1, wH)
        dc.fillRect(x + wW - 1, y, 1, wH); dc.fillRect(x, y + wH - 1, wW, 1)
      }
    }

  } else if (type === 'brick') {
    // Brick — mortar courses + staggered joints + cream-framed windows
    const bH = fH * 0.32
    dc.fillStyle = 'rgba(255,235,195,0.16)'
    for (let y = 0; y < H; y += bH) dc.fillRect(0, y, W, 1)
    // Staggered vertical joints
    let row = 0
    for (let y = 0; y < H; y += bH) {
      const brickW = W / 4
      const off = (row % 2) * (brickW / 2)
      dc.fillStyle = 'rgba(255,235,195,0.10)'
      for (let bx = -off; bx < W; bx += brickW) dc.fillRect(bx, y, 1, bH)
      row++
    }
    // Subtle per-brick colour variation
    for (let i = 0; i < 28; i++) {
      const alpha = (sr(seed * 41 + i) - 0.5) * 0.12
      dc.fillStyle = alpha > 0 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${-alpha})`
      dc.fillRect(sr(seed * 43 + i) * W, sr(seed * 47 + i) * H, W / 4.5, bH * 0.82)
    }
    const wW = colW * 0.55, wH = fH * 0.50, pY = fH * 0.25
    for (let f = 0; f < floors; f++) {
      for (let col = 0; col < cols; col++) {
        const x = col * colW + (colW - wW) / 2, y = f * fH + pY
        dc.fillStyle = 'rgba(220,200,165,0.60)'; dc.fillRect(x - 3, y - 3, wW + 6, wH + 6)
        dc.fillStyle = sr(seed * 7 + f * 31 + col * 17) > 0.32 ? '#3e4e5c' : '#222a32'
        dc.fillRect(x, y, wW, wH)
        dc.fillStyle = 'rgba(200,178,142,0.45)'; dc.fillRect(x - 2, y + wH, wW + 4, 3)
      }
    }

  } else {
    // Residential — colorful, balcony hints, varied windows
    dc.fillStyle = 'rgba(255,255,255,0.10)'
    for (let f = 0; f <= floors; f++) dc.fillRect(0, f * fH - 1, W, 2)
    for (let f = 0; f < floors; f++) {
      for (let col = 0; col < cols; col++) {
        const sv  = sr(seed * 11 + f * 7 + col) * 0.16
        const wW  = colW * (0.54 + sv), wH = fH * (0.50 + sv * 0.4), pY = fH * 0.22
        const x   = col * colW + (colW - wW) / 2, y = f * fH + pY
        dc.fillStyle = sr(seed * 7 + f * 31 + col * 17) > 0.28 ? '#485870' : '#262f3a'
        dc.fillRect(x, y, wW, wH)
        dc.fillStyle = 'rgba(238,232,218,0.50)'
        dc.fillRect(x, y, wW, 1); dc.fillRect(x, y, 1, wH)
        dc.fillRect(x + wW - 1, y, 1, wH); dc.fillRect(x, y + wH - 1, wW, 1)
        // Balcony rail hint every 3rd floor
        if (f % 3 === 1 && sr(seed * 53 + f + col) > 0.42) {
          dc.fillStyle = 'rgba(200,195,182,0.40)'; dc.fillRect(x - 4, y + wH + 1, wW + 8, 3)
          for (let p = 0; p < 4; p++) dc.fillRect(x - 3 + p * (wW + 6) / 3, y + wH + 1, 1, 3)
        }
      }
    }
  }

  return new THREE.CanvasTexture(c)
}

function createNightEmissiveTex(seed, floors, cols, type) {
  const W = 256, H = 512
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, W, H)

  const glow = NIGHT_GLOW[type] || '#fff8cc'
  const colW = W / cols, winW = colW * 0.65, winH = (H / floors) * 0.55, padY = (H / floors) * 0.22
  for (let f = 0; f < floors; f++) {
    for (let col = 0; col < cols; col++) {
      if (seededRand(seed * 7 + f * 31 + col * 17) <= 0.32) continue
      const x = col * colW + (colW - winW) / 2, y = f * (H / floors) + padY
      ctx.fillStyle = glow; ctx.fillRect(x, y, winW, winH)
    }
  }
  return { texture: new THREE.CanvasTexture(c), canvas: c, floors, cols, type }
}

// ── Texture pool ──────────────────────────────────────────────────────────────

function buildTexturePools() {
  const dayMaps = [], nightMaps = [], nightData = []
  TYPES.forEach((type, ti) => {
    dayMaps[ti] = []; nightMaps[ti] = []; nightData[ti] = []
    const { floors, cols } = TYPE_CFG[type]
    for (let v = 0; v < N_VARIANTS; v++) {
      const seed       = ti * 1000 + v * 200
      dayMaps[ti][v]   = createFacadeTextures(seed, floors, cols, type)
      const nd         = createNightEmissiveTex(seed, floors, cols, type)
      nightMaps[ti][v] = nd.texture
      nightData[ti][v] = nd
    }
  })
  return { dayMaps, nightMaps, nightData }
}

// ── Single InstancedMesh bucket ───────────────────────────────────────────────

function InstancedTier({ instances, dayMap, nightMap, typeIdx, isDaytime }) {
  const ref = useRef()

  useEffect(() => {
    if (!ref.current || instances.length === 0) return
    const dummy = new THREE.Object3D()
    instances.forEach((inst, i) => {
      dummy.position.set(inst.x, inst.y, inst.z)
      dummy.scale.set(inst.w, inst.h, inst.d)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [instances])

  if (instances.length === 0) return null

  const type = TYPES[typeIdx]
  const cfg  = TYPE_CFG[type]
  const metalness = isDaytime ? cfg.metalness : Math.min(cfg.metalness + 0.05, 0.15)
  const roughness = isDaytime ? cfg.roughness : Math.max(cfg.roughness - 0.1, 0.65)

  return (
    <instancedMesh ref={ref} args={[null, null, instances.length]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        map={dayMap}
        emissiveMap={nightMap}
        emissive="#ffffff"
        emissiveIntensity={isDaytime ? 0 : 0.7}
        metalness={metalness}
        roughness={roughness}
      />
    </instancedMesh>
  )
}

// ── Antenna spires (instanced) ────────────────────────────────────────────────

function Antennas({ buildings }) {
  const ref = useRef()

  useEffect(() => {
    if (!ref.current) return
    const dummy = new THREE.Object3D()
    buildings.forEach((b, i) => {
      dummy.position.set(b.x, b.totalH + 1.5, b.z)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [buildings])

  return (
    <instancedMesh ref={ref} args={[null, null, buildings.length]}>
      <cylinderGeometry args={[0.04, 0.04, 3, 4]} />
      <meshStandardMaterial color="#667788" roughness={0.6} metalness={0.4} />
    </instancedMesh>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function CityGrid() {
  const { isDaytime } = useScene()
  const { dayMaps, nightMaps, nightData } = useMemo(() => buildTexturePools(), [])
  const buildings = useMemo(() => generateBuildings(), [])

  // Staggered flicker timers so textures don't all update at once
  const flickerTimers = useRef(
    Array.from({ length: TYPES.length * N_VARIANTS }, (_, i) => i * 0.4 + 1)
  )

  useFrame((_, delta) => {
    if (isDaytime) return
    for (let ti = 0; ti < TYPES.length; ti++) {
      for (let vi = 0; vi < N_VARIANTS; vi++) {
        const idx = ti * N_VARIANTS + vi
        flickerTimers.current[idx] -= delta
        if (flickerTimers.current[idx] > 0) continue
        flickerTimers.current[idx] = 2 + Math.random() * 6

        const { canvas, floors, cols, type } = nightData[ti][vi]
        const ctx = canvas.getContext('2d')
        const W = canvas.width, H = canvas.height
        const colW = W / cols
        const winW = colW * 0.65
        const winH = (H / floors) * 0.55
        const padY = (H / floors) * 0.22
        const glow = NIGHT_GLOW[type] || '#fff8cc'

        // Toggle 1–2 random windows per update
        const count = 1 + Math.floor(Math.random() * 2)
        for (let k = 0; k < count; k++) {
          const f  = Math.floor(Math.random() * floors)
          const ci = Math.floor(Math.random() * cols)
          const x  = ci * colW + (colW - winW) / 2
          const y  = f * (H / floors) + padY
          const lit = ctx.getImageData(x + 2, y + 2, 1, 1).data[0] > 50
          ctx.fillStyle = lit ? '#000000' : glow
          ctx.fillRect(x, y, winW, winH)
        }
        nightMaps[ti][vi].needsUpdate = true
      }
    }
  })

  // Group into [tier][typeIdx][variantIdx] buckets
  const buckets = useMemo(() => {
    const b = Array.from({ length: 3 }, () =>
      Array.from({ length: TYPES.length }, () =>
        Array.from({ length: N_VARIANTS }, () => [])
      )
    )
    buildings.forEach(bld => {
      const { x, z, typeIdx, variantIdx, baseW, baseD, t1H, t2H, t3H, t2W, t2D, t3W, t3D, stepped } = bld
      // Each tier uses a slightly offset variant so window patterns differ between tiers
      const vi1 = variantIdx
      const vi2 = (variantIdx + 1) % N_VARIANTS
      const vi3 = (variantIdx + 2) % N_VARIANTS
      b[0][typeIdx][vi1].push({ x, y: t1H / 2,              z, w: baseW, h: t1H, d: baseD })
      if (stepped) {
        b[1][typeIdx][vi2].push({ x, y: t1H + t2H / 2,       z, w: t2W,  h: t2H, d: t2D })
        b[2][typeIdx][vi3].push({ x, y: t1H + t2H + t3H / 2, z, w: t3W,  h: t3H, d: t3D })
      }
    })
    return b
  }, [buildings])

  return (
    <group>
      {[0, 1, 2].flatMap(tier =>
        TYPES.flatMap((_, ti) =>
          Array.from({ length: N_VARIANTS }, (_, vi) => (
            <InstancedTier
              key={`${tier}-${ti}-${vi}`}
              instances={buckets[tier][ti][vi]}
              dayMap={dayMaps[ti][vi]}
              nightMap={nightMaps[ti][vi]}
              typeIdx={ti}
              isDaytime={isDaytime}
            />
          ))
        )
      )}
      <Antennas buildings={buildings} />
    </group>
  )
}
