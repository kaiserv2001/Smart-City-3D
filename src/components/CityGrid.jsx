import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useScene } from '../SceneContext'
import { seededRand, generateBuildings } from '../cityData'

const TYPES      = ['glass', 'corporate', 'residential']
const N_VARIANTS = 5

// ── Texture generators (unchanged) ──────────────────────────────────────────

function createFacadeTextures(seed, floors = 14, cols = 4, type = 'corporate') {
  const W = 256, H = 512
  const diffC = document.createElement('canvas'); diffC.width = W; diffC.height = H
  const dc = diffC.getContext('2d')

  const base = type === 'glass'
    ? ['#5a7888','#4e6c7c','#527080','#4a6878'][Math.floor(seededRand(seed) * 4)]
    : type === 'corporate'
      ? ['#a09080','#988870','#b0a090','#a89880'][Math.floor(seededRand(seed) * 4)]
      : ['#b0a898','#a89888','#b8b0a0','#a8a090'][Math.floor(seededRand(seed) * 4)]

  dc.fillStyle = base
  dc.fillRect(0, 0, W, H)

  dc.fillStyle = type === 'glass' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'
  for (let c = 0; c <= cols; c++) dc.fillRect((W / cols) * c - 1, 0, 2, H)
  for (let f = 0; f <= floors; f++) {
    const y = (H / floors) * f
    dc.fillStyle = type === 'glass' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
    dc.fillRect(0, y - 1, W, 2)
  }

  const colW = W / cols, winW = colW * 0.68, winH = (H / floors) * 0.58, padY = (H / floors) * 0.22

  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      const x = c * colW + (colW - winW) / 2, y = f * (H / floors) + padY
      if (type === 'glass') {
        const grad = dc.createLinearGradient(x, y, x, y + winH)
        grad.addColorStop(0,   'rgba(160,210,240,0.85)')
        grad.addColorStop(0.4, 'rgba(130,185,220,0.75)')
        grad.addColorStop(1,   'rgba(80,130,170,0.65)')
        dc.fillStyle = grad
        dc.fillRect(x, y, winW, winH)
        dc.fillStyle = 'rgba(255,255,255,0.25)'
        dc.fillRect(x + 2, y + 2, winW * 0.25, winH * 0.18)
      } else {
        const lit = seededRand(seed * 7 + f * 31 + c * 17) > 0.35
        dc.fillStyle = lit ? '#4a5868' : '#2a3440'
        dc.fillRect(x, y, winW, winH)
        dc.fillStyle = type === 'corporate' ? 'rgba(180,160,140,0.6)' : 'rgba(200,190,170,0.5)'
        dc.fillRect(x, y, winW, 1); dc.fillRect(x, y, 1, winH)
        dc.fillRect(x + winW - 1, y, 1, winH); dc.fillRect(x, y + winH - 1, winW, 1)
      }
    }
  }
  return new THREE.CanvasTexture(diffC)
}

function createNightEmissiveTex(seed, floors, cols, warm) {
  const W = 256, H = 512
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, W, H)

  const colW = W / cols, winW = colW * 0.68, winH = (H / floors) * 0.58, padY = (H / floors) * 0.22
  for (let f = 0; f < floors; f++) {
    for (let col = 0; col < cols; col++) {
      if (seededRand(seed * 7 + f * 31 + col * 17) <= 0.32) continue
      const x = col * colW + (colW - winW) / 2, y = f * (H / floors) + padY
      ctx.fillStyle = warm ? '#fff8cc' : '#cce8ff'
      ctx.fillRect(x, y, winW, winH)
    }
  }
  return new THREE.CanvasTexture(c)
}

// ── Texture pool (N_VARIANTS per type, shared across all buildings) ──────────

function buildTexturePools() {
  const dayMaps = [], nightMaps = []
  TYPES.forEach((type, ti) => {
    dayMaps[ti] = []; nightMaps[ti] = []
    const floors = type === 'glass' ? 16 : type === 'corporate' ? 14 : 12
    const cols   = type === 'glass' ? 6 : 4
    const warm   = type !== 'glass'
    for (let v = 0; v < N_VARIANTS; v++) {
      const seed = ti * 1000 + v * 200
      dayMaps[ti][v]   = createFacadeTextures(seed, floors, cols, type)
      nightMaps[ti][v] = createNightEmissiveTex(seed, floors, cols, warm)
    }
  })
  return { dayMaps, nightMaps }
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
  const metalness = isDaytime ? (type === 'glass' ? 0.15 : 0.05) : 0.1
  const roughness = isDaytime ? (type === 'glass' ? 0.08 : type === 'corporate' ? 0.82 : 0.88) : 0.7

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
  const { dayMaps, nightMaps } = useMemo(() => buildTexturePools(), [])
  const buildings               = useMemo(() => generateBuildings(), [])

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
