import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

function createCloudTex() {
  const S = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = S
  const ctx = canvas.getContext('2d')

  const puff = (cx, cy, r) => {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    g.addColorStop(0,   'rgba(255,255,255,0.95)')
    g.addColorStop(0.45,'rgba(255,255,255,0.6)')
    g.addColorStop(1,   'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }

  puff(128, 148, 90)
  puff(70,  158, 64)
  puff(190, 152, 72)
  puff(128,  98, 58)
  puff(98,  125, 46)
  puff(162, 125, 50)

  return new THREE.CanvasTexture(canvas)
}

function sr(s) { const x = Math.sin(s+1)*43758.5453; return x - Math.floor(x) }

// Pre-generate cloud layout — two layers at different altitudes and speeds
const CLOUDS = Array.from({ length: 16 }, (_, i) => ({
  x:     (sr(i * 7)   - 0.5) * 220,
  y:      38 + sr(i * 13) * 18,
  z:     (sr(i * 19)  - 0.5) * 220,
  sx:     44 + sr(i * 23) * 28,
  sy:     16 + sr(i * 31) * 10,
  layer:  i % 2,
}))

export default function MovingClouds() {
  const tex  = useMemo(() => createCloudTex(), [])
  const r0   = useRef()
  const r1   = useRef()

  useFrame((_, delta) => {
    if (r0.current) {
      r0.current.position.x += delta * 2.2
      if (r0.current.position.x > 140) r0.current.position.x -= 280
    }
    if (r1.current) {
      r1.current.position.x += delta * 1.1
      if (r1.current.position.x > 140) r1.current.position.x -= 280
    }
  })

  return (
    <group>
      <group ref={r0}>
        {CLOUDS.filter(c => c.layer === 0).map((c, i) => (
          <sprite key={i} position={[c.x, c.y, c.z]} scale={[c.sx, c.sy, 1]}>
            <spriteMaterial map={tex} transparent opacity={0.88} depthWrite={false} color="#ffffff" />
          </sprite>
        ))}
      </group>
      <group ref={r1}>
        {CLOUDS.filter(c => c.layer === 1).map((c, i) => (
          <sprite key={i} position={[c.x, c.y, c.z]} scale={[c.sx * 1.2, c.sy * 1.1, 1]}>
            <spriteMaterial map={tex} transparent opacity={0.72} depthWrite={false} color="#e8eeff" />
          </sprite>
        ))}
      </group>
    </group>
  )
}
