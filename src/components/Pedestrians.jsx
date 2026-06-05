import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

const ROAD_OFFSETS = [-96, -48, 0, 48, 96]
const WALK_LIMIT   = 44  // half-segment length between intersections
const HALF_ROAD    = 100

const SHIRT_COLORS = ['#cc4422','#2244cc','#228844','#cc8822','#884488','#cc2266','#226688','#aaaaaa','#cc9944','#44aacc']
const SKIN_COLORS  = ['#f4c594','#c68642','#8d5524','#fdbcb4','#e8b89a']

function seededRand(seed) {
  const x = Math.sin(seed + 1) * 43758.5453
  return x - Math.floor(x)
}

// Build pedestrian data — no React state, just plain objects
function buildPedestrians(count = 35) {
  return Array.from({ length: count }, (_, i) => {
    const s = i * 137 + 1
    const axis  = seededRand(s)     > 0.5 ? 'x' : 'z'
    const road  = ROAD_OFFSETS[Math.floor(seededRand(s + 1) * ROAD_OFFSETS.length)]
    const side  = seededRand(s + 2) > 0.5 ? 5.6 : -5.6
    const dir   = seededRand(s + 3) > 0.5 ? 1   : -1
    const speed = 1.4 + seededRand(s + 4) * 1.4
    const phase = seededRand(s + 5) * Math.PI * 2
    // Start spread across the full road length
    const startPos = (seededRand(s + 6) - 0.5) * HALF_ROAD * 2

    // Assign to a segment between two intersections so they don't cross junctions
    const segs = [-96, -48, 0, 48, 96]
    const segIdx = Math.floor(seededRand(s + 7) * (segs.length - 1))
    const segMin = segs[segIdx]     + 6
    const segMax = segs[segIdx + 1] - 6

    return {
      axis, road, side, dir, speed, phase,
      segMin, segMax,
      pos: segMin + seededRand(s + 8) * (segMax - segMin),
      shirt: SHIRT_COLORS[Math.floor(seededRand(s + 9)  * SHIRT_COLORS.length)],
      skin:  SKIN_COLORS [Math.floor(seededRand(s + 10) * SKIN_COLORS.length)],
    }
  })
}

export default function Pedestrians() {
  const peds    = useMemo(() => buildPedestrians(35), [])
  const posRef  = useRef(peds.map(p => p.pos))
  const grpRefs = useRef([])
  const lArmRefs = useRef([])
  const rArmRefs = useRef([])

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime

    peds.forEach((ped, i) => {
      // Advance position
      posRef.current[i] += ped.speed * ped.dir * delta
      // Bounce back at segment ends
      if (posRef.current[i] > ped.segMax) { posRef.current[i] = ped.segMax; peds[i].dir = -1 }
      if (posRef.current[i] < ped.segMin) { posRef.current[i] = ped.segMin; peds[i].dir =  1 }

      const grp = grpRefs.current[i]
      if (!grp) return

      // Walking bob
      const bob = Math.abs(Math.sin(t * ped.speed * 3.5 + ped.phase)) * 0.07

      if (ped.axis === 'x') {
        grp.position.set(posRef.current[i], bob, ped.road + ped.side)
        grp.rotation.y = peds[i].dir > 0 ? 0 : Math.PI
      } else {
        grp.position.set(ped.road + ped.side, bob, posRef.current[i])
        grp.rotation.y = peds[i].dir > 0 ? Math.PI / 2 : -Math.PI / 2
      }

      // Arm swing
      const swing = Math.sin(t * ped.speed * 7 + ped.phase) * 0.55
      if (lArmRefs.current[i]) lArmRefs.current[i].rotation.x =  swing
      if (rArmRefs.current[i]) rArmRefs.current[i].rotation.x = -swing
    })
  })

  return (
    <group>
      {peds.map((ped, i) => (
        <group
          key={i}
          ref={el => (grpRefs.current[i] = el)}
          position={
            ped.axis === 'x'
              ? [ped.pos, 0, ped.road + ped.side]
              : [ped.road + ped.side, 0, ped.pos]
          }
        >
          {/* Head */}
          <mesh position={[0, 1.72, 0]}>
            <sphereGeometry args={[0.14, 8, 7]} />
            <meshStandardMaterial color={ped.skin} roughness={0.8} />
          </mesh>
          {/* Hair */}
          <mesh position={[0, 1.83, 0]}>
            <sphereGeometry args={[0.105, 8, 5]} />
            <meshStandardMaterial color={seededRand(i * 17) > 0.5 ? '#1a0e06' : '#8a6030'} roughness={0.9} />
          </mesh>
          {/* Body / torso */}
          <mesh position={[0, 1.1, 0]}>
            <capsuleGeometry args={[0.13, 0.55, 4, 8]} />
            <meshStandardMaterial color={ped.shirt} roughness={0.85} />
          </mesh>
          {/* Left arm */}
          <group ref={el => (lArmRefs.current[i] = el)} position={[-0.2, 1.35, 0]}>
            <mesh position={[0, -0.22, 0]}>
              <capsuleGeometry args={[0.055, 0.38, 3, 6]} />
              <meshStandardMaterial color={ped.shirt} roughness={0.85} />
            </mesh>
          </group>
          {/* Right arm */}
          <group ref={el => (rArmRefs.current[i] = el)} position={[0.2, 1.35, 0]}>
            <mesh position={[0, -0.22, 0]}>
              <capsuleGeometry args={[0.055, 0.38, 3, 6]} />
              <meshStandardMaterial color={ped.shirt} roughness={0.85} />
            </mesh>
          </group>
          {/* Legs (static — bob handles the illusion of stepping) */}
          <mesh position={[-0.1, 0.38, 0]}>
            <capsuleGeometry args={[0.07, 0.52, 3, 6]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.85} />
          </mesh>
          <mesh position={[0.1, 0.38, 0]}>
            <capsuleGeometry args={[0.07, 0.52, 3, 6]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
