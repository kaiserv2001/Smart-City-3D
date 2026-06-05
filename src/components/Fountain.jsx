import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScene } from '../SceneContext'

const N_JETS  = 8    // jets in a ring
const N_DROPS = 14   // particles per jet
const MAX_H   = 5.2  // peak height
const SPREAD  = 1.5  // max radial spread at apex
const BASE_Y  = 1.75 // nozzle height
const SPEED   = 0.65 // arc cycles per second

const TOTAL = N_JETS * N_DROPS

export default function Fountain() {
  const { isDaytime } = useScene()
  const pointsRef = useRef()

  const { positions, angles, phases } = useMemo(() => {
    const positions = new Float32Array(TOTAL * 3)
    const angles    = new Float32Array(TOTAL)
    const phases    = new Float32Array(TOTAL)
    for (let j = 0; j < N_JETS; j++) {
      const baseAngle = (j / N_JETS) * Math.PI * 2
      for (let d = 0; d < N_DROPS; d++) {
        const idx = j * N_DROPS + d
        // Slight random spread per jet so streams aren't perfectly identical
        const sr = (Math.sin(idx * 127.1) * 43758.5453) % 1
        angles[idx] = baseAngle + (sr - 0.5) * 0.25
        phases[idx] = d / N_DROPS
      }
    }
    return { positions, angles, phases }
  }, [])

  useFrame(state => {
    const t   = state.clock.elapsedTime * SPEED
    const arr = pointsRef.current.geometry.attributes.position.array
    for (let i = 0; i < TOTAL; i++) {
      const lt = ((t + phases[i]) % 1.0)        // 0–1 through arc
      const h  = MAX_H  * 4 * lt * (1 - lt)     // parabola
      const r  = SPREAD * lt
      arr[i * 3]     = Math.cos(angles[i]) * r
      arr[i * 3 + 1] = BASE_Y + h
      arr[i * 3 + 2] = Math.sin(angles[i]) * r
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    // Placed at (12, 0, 12) — NE quadrant of the central plaza (no road, no buildings)
    <group position={[12, 0, 12]}>
      {/* Outer basin wall */}
      <mesh position={[0, 0.22, 0]} receiveShadow>
        <cylinderGeometry args={[3.9, 4.1, 0.5, 40]} />
        <meshStandardMaterial color="#8a9aaa" roughness={0.7} metalness={0.15} />
      </mesh>
      {/* Rim torus */}
      <mesh position={[0, 0.48, 0]}>
        <torusGeometry args={[3.9, 0.13, 8, 52]} />
        <meshStandardMaterial color="#9aaabc" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Water pool surface */}
      <mesh position={[0, 0.44, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.75, 48]} />
        <meshStandardMaterial
          color={isDaytime ? '#3a7aaa' : '#1a3a6a'}
          emissive={isDaytime ? '#000000' : '#0044aa'}
          emissiveIntensity={isDaytime ? 0 : 1.0}
          transparent opacity={0.72}
          roughness={0.08} metalness={0.35}
        />
      </mesh>
      {/* Pedestal */}
      <mesh position={[0, 1.08, 0]}>
        <cylinderGeometry args={[0.24, 0.3, 1.44, 14]} />
        <meshStandardMaterial color="#7a8a9a" roughness={0.65} metalness={0.2} />
      </mesh>
      {/* Nozzle cap */}
      <mesh position={[0, 1.84, 0]}>
        <cylinderGeometry args={[0.32, 0.24, 0.15, 14]} />
        <meshStandardMaterial color="#5a6a7a" roughness={0.5} metalness={0.35} />
      </mesh>

      {/* Water jet particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={TOTAL}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={isDaytime ? '#99ddff' : '#55bbff'}
          size={isDaytime ? 0.16 : 0.2}
          transparent
          opacity={isDaytime ? 0.75 : 0.9}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  )
}
