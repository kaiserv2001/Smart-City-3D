import { useMemo } from 'react'
import * as THREE from 'three'
import { useScene } from '../SceneContext'
import { seededRand, generateBuildings } from '../cityData'

const TEXTS = [
  'NEXUS CORP', 'CYBER CITY', 'ALPHA NET', 'ZONE 7',
  'SYNC NOW',   'ULTRA TECH', 'NEO TRADE', 'PULSE HUB',
  'DATA FLOW',  'MATRIX X',  'NOVA LINK', 'GRID CORE',
  'HYPER NET',  'CORE SYS',  'LINK UP',   'VOLT NET',
]
const COLORS = ['#00ffff','#ff0088','#ffee00','#00ff88','#ff4400','#aa00ff','#00aaff']

// Roads run at these positions on both axes
const ROAD_LINES = [0, 48, 96, -48, -96]

function nearestRoad(pos) {
  return ROAD_LINES.reduce((best, r) =>
    Math.abs(r - pos) < Math.abs(best - pos) ? r : best
  )
}

function createBillboardTex(text, color) {
  const W = 256, H = 128
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#040a12'
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = color
  ctx.lineWidth = 2.5
  ctx.strokeRect(5, 5, W - 10, H - 10)

  // Corner L-brackets
  const ac = 14
  ctx.fillStyle = color
  ;[
    [5,5,ac,2.5],[5,5,2.5,ac],[W-5-ac,5,ac,2.5],[W-7.5,5,2.5,ac],
    [5,H-7.5,ac,2.5],[5,H-5-ac,2.5,ac],[W-5-ac,H-7.5,ac,2.5],[W-7.5,H-5-ac,2.5,ac],
  ].forEach(([x,y,w,h]) => ctx.fillRect(x,y,w,h))

  // Scan-line texture
  ctx.fillStyle = `${color}18`
  for (let y = 10; y < H - 10; y += 5) ctx.fillRect(8, y, W - 16, 2)

  ctx.font = 'bold 25px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 18
  ctx.fillText(text, W / 2, H / 2 - 10)

  ctx.font = '10px monospace'
  ctx.shadowBlur = 8
  ctx.fillStyle = `${color}bb`
  ctx.fillText('■  ■  ■', W / 2, H / 2 + 22)

  return new THREE.CanvasTexture(canvas)
}

export default function Billboards() {
  const { isDaytime } = useScene()

  const { boards, textures } = useMemo(() => {
    const buildings = generateBuildings()
    const boards = []

    buildings.forEach((bld, idx) => {
      if (boards.length >= 28) return
      // ~15% of buildings get a billboard, seeded
      if (seededRand(idx * 113 + 7) > 0.15) return

      const { x, z, baseW, baseD, totalH } = bld

      // Find the nearest road on each axis
      const nearX = nearestRoad(x)
      const nearZ = nearestRoad(z)
      const dX = Math.abs(nearX - x)
      const dZ = Math.abs(nearZ - z)

      // Place billboard on the building face that points toward the nearest road.
      // planeGeometry normal starts as +Z; after rotY θ it becomes (sin θ, 0, cos θ).
      let bx, bz, rotY
      if (dX < dZ) {
        // Closer to an x-axis road → put sign on east or west face
        bx    = nearX < x ? x - baseW / 2 - 0.15 : x + baseW / 2 + 0.15
        bz    = z
        rotY  = nearX < x ? -Math.PI / 2 : Math.PI / 2
      } else {
        // Closer to a z-axis road → put sign on north or south face
        bx    = x
        bz    = nearZ < z ? z - baseD / 2 - 0.15 : z + baseD / 2 + 0.15
        rotY  = nearZ < z ? Math.PI : 0
      }

      const y = Math.min(totalH * 0.45, 14) + 2
      const w = Math.min(baseW * 0.65, 4.8)
      const h = Math.min(w * 0.44, 2.2)

      const ti = Math.floor(seededRand(idx * 17 + 3) * TEXTS.length)
      const ci = Math.floor(seededRand(idx * 31 + 11) * COLORS.length)

      boards.push({ x: bx, y, z: bz, rotY, w, h, text: TEXTS[ti], color: COLORS[ci] })
    })

    const textures = boards.map(b => createBillboardTex(b.text, b.color))
    return { boards, textures }
  }, [])

  return (
    <group>
      {boards.map((b, i) => (
        <group key={i} position={[b.x, b.y, b.z]} rotation={[0, b.rotY, 0]}>
          {/* Backing panel */}
          <mesh position={[0, 0, -0.1]}>
            <boxGeometry args={[b.w + 0.4, b.h + 0.4, 0.18]} />
            <meshStandardMaterial color="#080e18" metalness={0.5} roughness={0.5} />
          </mesh>
          {/* Support struts */}
          {[-b.w * 0.3, b.w * 0.3].map((sx, j) => (
            <mesh key={j} position={[sx, -b.h / 2 - 0.45, 0]}>
              <boxGeometry args={[0.1, 0.9, 0.1]} />
              <meshStandardMaterial color="#1a2a3a" metalness={0.7} roughness={0.4} />
            </mesh>
          ))}
          {/* Glowing face */}
          <mesh>
            <planeGeometry args={[b.w, b.h]} />
            <meshStandardMaterial
              map={textures[i]}
              emissiveMap={textures[i]}
              emissive="#ffffff"
              emissiveIntensity={isDaytime ? 0.15 : 1.6}
              roughness={0.1} metalness={0}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
