import { useMemo } from 'react'

function seededRand(seed) {
  const x = Math.sin(seed + 1) * 43758.5453
  return x - Math.floor(x)
}

const FOLIAGE_COLORS = ['#2d7a28', '#348030', '#3a8835', '#2a7224', '#3d8c38', '#4a9042', '#266e22']
const ROAD_OFFSETS   = [-96, -48, 0, 48, 96]
const SPACING        = 18
const HALF           = 108

function Tree({ position, seed }) {
  const scale  = 0.75 + seededRand(seed) * 0.5
  const color  = FOLIAGE_COLORS[Math.floor(seededRand(seed + 1) * FOLIAGE_COLORS.length)]
  const color2 = FOLIAGE_COLORS[Math.floor(seededRand(seed + 2) * FOLIAGE_COLORS.length)]
  const lean   = (seededRand(seed + 3) - 0.5) * 0.08

  return (
    <group position={position} rotation={[lean, seededRand(seed + 4) * Math.PI * 2, lean * 0.5]} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.12, 0.2, 2.2, 6]} />
        <meshStandardMaterial color="#2a1a08" roughness={0.95} metalness={0} />
      </mesh>

      {/* Lower foliage */}
      <mesh position={[0, 3.2, 0]}>
        <sphereGeometry args={[1.15, 7, 6]} />
        <meshStandardMaterial color={color} roughness={0.95} metalness={0} />
      </mesh>
      {/* Mid foliage */}
      <mesh position={[0.15, 4.1, 0.1]}>
        <sphereGeometry args={[0.9, 7, 5]} />
        <meshStandardMaterial color={color2} roughness={0.95} metalness={0} />
      </mesh>
      {/* Top foliage */}
      <mesh position={[-0.1, 4.9, -0.1]}>
        <sphereGeometry args={[0.6, 6, 5]} />
        <meshStandardMaterial color={color} roughness={0.95} metalness={0} />
      </mesh>
    </group>
  )
}

export default function Trees() {
  const trees = useMemo(() => {
    const list = []
    let seed = 0

    // Trees along road sidewalks — offset 5.5 units from road center
    ROAD_OFFSETS.forEach(roadPos => {
      for (let p = -HALF; p <= HALF; p += SPACING) {
        const jitter = (seededRand(seed * 7 + p) - 0.5) * 2

        // Skip near intersections and skip if position is on a perpendicular road
        const nearIntersection = ROAD_OFFSETS.some(r => Math.abs(p - r) < 8)
        const onRoad = ROAD_OFFSETS.some(r => Math.abs(p - r) < 3.5)
        if (nearIntersection || onRoad) { seed++; continue }

        // X-road sidewalk trees
        list.push({ pos: [p + jitter, 0, roadPos + 5.5], seed: seed++ })
        list.push({ pos: [p + jitter, 0, roadPos - 5.5], seed: seed++ })

        // Z-road sidewalk trees
        list.push({ pos: [roadPos + 5.5, 0, p + jitter], seed: seed++ })
        list.push({ pos: [roadPos - 5.5, 0, p + jitter], seed: seed++ })
      }
    })

    // Central plaza — 4 quadrants between the x=0 and z=0 roads
    // Safe zone: |x| > 3.5 AND |z| > 3.5, AND away from ±48 roads
    const plazaPositions = [
      // NE quadrant
      [6, 0, 6], [9, 0, 7], [7, 0, 10], [10, 0, 9],
      // NW quadrant
      [-6, 0, 6], [-9, 0, 8], [-7, 0, 10],
      // SW quadrant
      [-6, 0, -6], [-9, 0, -7], [-7, 0, -10],
      // SE quadrant
      [6, 0, -6], [9, 0, -8], [7, 0, -10],
    ]
    // Exclude trees too close to the fountain at (12, 0, 12)
    const nearFountain = ([x, , z]) => Math.hypot(x - 12, z - 12) < 5.5
    plazaPositions
      .filter(p => !nearFountain(p))
      .forEach(p => list.push({ pos: p, seed: seed++ }))

    return list
  }, [])

  return (
    <group>
      {trees.map((t, i) => <Tree key={i} position={t.pos} seed={t.seed} />)}
    </group>
  )
}
