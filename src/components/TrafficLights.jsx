import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

// Only the 9 central intersections for performance (±48 and 0 on both axes)
const INTERSECTIONS = [-48, 0, 48]
const CYCLE   = 13    // total seconds per full cycle
const G_END   = 5     // green → yellow at 5s
const Y_END   = 6.5   // yellow → red at 6.5s

// Single pole+housing+3-bulbs; parent drives emissive via refs
function TrafficLightPole({ position, rotY, idx, redRefs, yelRefs, grnRefs }) {
  const rRef = el => { redRefs.current[idx] = el }
  const yRef = el => { yelRefs.current[idx] = el }
  const gRef = el => { grnRefs.current[idx] = el }

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Pole */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.06, 0.09, 5, 6]} />
        <meshStandardMaterial color="#2a3344" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, 5.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 5]} />
        <meshStandardMaterial color="#2a3344" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Housing box */}
      <mesh position={[0, 5.2, 0]}>
        <boxGeometry args={[0.28, 0.95, 0.3]} />
        <meshStandardMaterial color="#0d1117" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Red */}
      <mesh position={[0, 5.57, 0.16]}>
        <sphereGeometry args={[0.09, 8, 6]} />
        <meshStandardMaterial ref={rRef} color="#ff2200" emissive="#ff2200" emissiveIntensity={0.06} />
      </mesh>
      {/* Yellow */}
      <mesh position={[0, 5.20, 0.16]}>
        <sphereGeometry args={[0.09, 8, 6]} />
        <meshStandardMaterial ref={yRef} color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.06} />
      </mesh>
      {/* Green */}
      <mesh position={[0, 4.83, 0.16]}>
        <sphereGeometry args={[0.09, 8, 6]} />
        <meshStandardMaterial ref={gRef} color="#00dd44" emissive="#00dd44" emissiveIntensity={0.06} />
      </mesh>
    </group>
  )
}

export default function TrafficLights() {
  const redRefs = useRef([])
  const yelRefs = useRef([])
  const grnRefs = useRef([])

  // 4 poles per intersection: 2 face X-traffic (phase 0), 2 face Z-traffic (phase offset)
  const poles = useMemo(() => {
    const list = []
    INTERSECTIONS.forEach(ix => {
      INTERSECTIONS.forEach(iz => {
        const o = 3.2
        // Faces X-direction (north/south of road), green when X-traffic moves
        list.push({ position: [ix + o, 0, iz + o], rotY: Math.PI,      phase: 0 })
        list.push({ position: [ix - o, 0, iz - o], rotY: 0,             phase: 0 })
        // Faces Z-direction (east/west of road), green when Z-traffic moves
        list.push({ position: [ix + o, 0, iz - o], rotY: -Math.PI / 2,  phase: CYCLE / 2 })
        list.push({ position: [ix - o, 0, iz + o], rotY:  Math.PI / 2,  phase: CYCLE / 2 })
      })
    })
    return list
  }, [])

  // Single useFrame drives ALL poles
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    poles.forEach((p, i) => {
      const phase = (t + p.phase) % CYCLE
      const isGreen  = phase < G_END
      const isYellow = phase >= G_END && phase < Y_END
      const isRed    = phase >= Y_END

      if (redRefs.current[i]) redRefs.current[i].emissiveIntensity = isRed    ? 6 : 0.06
      if (yelRefs.current[i]) yelRefs.current[i].emissiveIntensity = isYellow ? 6 : 0.06
      if (grnRefs.current[i]) grnRefs.current[i].emissiveIntensity = isGreen  ? 6 : 0.06
    })
  })

  return (
    <group>
      {poles.map((p, i) => (
        <TrafficLightPole
          key={i}
          idx={i}
          position={p.position}
          rotY={p.rotY}
          redRefs={redRefs}
          yelRefs={yelRefs}
          grnRefs={grnRefs}
        />
      ))}
    </group>
  )
}
