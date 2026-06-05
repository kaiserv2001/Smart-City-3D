import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const RADIUS   = 52
const ALTITUDE = 62
const SPEED    = 0.09  // rad/s  ≈ 70-second orbit

function Body() {
  return (
    <group>
      {/* Main fuselage */}
      <mesh>
        <boxGeometry args={[4.4, 1.0, 1.3]} />
        <meshStandardMaterial color="#2a3a4a" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Cockpit */}
      <mesh position={[1.9, 0.08, 0]}>
        <boxGeometry args={[1.1, 0.88, 1.15]} />
        <meshStandardMaterial color="#1e3040" metalness={0.3} roughness={0.15} transparent opacity={0.88} />
      </mesh>
      {/* Cockpit glass face */}
      <mesh position={[2.46, 0.08, 0]}>
        <boxGeometry args={[0.07, 0.72, 1.08]} />
        <meshStandardMaterial color="#88bbdd" metalness={0.1} roughness={0.05} transparent opacity={0.45} />
      </mesh>
      {/* Tail boom */}
      <mesh position={[-3.3, 0.12, 0]}>
        <boxGeometry args={[2.4, 0.38, 0.38]} />
        <meshStandardMaterial color="#2a3a4a" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Tail fin */}
      <mesh position={[-4.4, 0.55, 0]}>
        <boxGeometry args={[0.3, 1.0, 0.1]} />
        <meshStandardMaterial color="#223344" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Landing skids */}
      {[-0.68, 0.68].map((sz, i) => (
        <group key={i}>
          <mesh position={[0.2, -0.68, sz]}>
            <boxGeometry args={[3.4, 0.09, 0.09]} />
            <meshStandardMaterial color="#182530" metalness={0.7} roughness={0.3} />
          </mesh>
          {[-1.1, 1.0].map((xp, j) => (
            <mesh key={j} position={[xp, -0.38, sz]}>
              <boxGeometry args={[0.09, 0.6, 0.09]} />
              <meshStandardMaterial color="#182530" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Nav lights — green starboard, red port */}
      <mesh position={[1.8, 0, -0.74]}>
        <sphereGeometry args={[0.09, 5, 4]} />
        <meshStandardMaterial color="#00ff55" emissive="#00ff55" emissiveIntensity={5} />
      </mesh>
      <mesh position={[1.8, 0, 0.74]}>
        <sphereGeometry args={[0.09, 5, 4]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={5} />
      </mesh>
    </group>
  )
}

export default function Helicopter() {
  const groupRef     = useRef()
  const mainRotor    = useRef()
  const tailRotor    = useRef()
  const strobeRef    = useRef()

  useFrame((state, delta) => {
    const t     = state.clock.elapsedTime
    const angle = t * SPEED

    // Circular orbit
    groupRef.current.position.set(
      Math.cos(angle) * RADIUS,
      ALTITUDE + Math.sin(t * 0.25) * 3.5,
      Math.sin(angle) * RADIUS,
    )
    // Nose follows tangent of circle
    groupRef.current.rotation.y = -angle - Math.PI / 2

    // Rotor spin
    if (mainRotor.current) mainRotor.current.rotation.y += delta * 18
    if (tailRotor.current) tailRotor.current.rotation.x += delta * 24

    // White belly strobe — blinks twice per second
    if (strobeRef.current) {
      strobeRef.current.material.emissiveIntensity = Math.floor(t * 2) % 2 === 0 ? 9 : 0
    }
  })

  return (
    <group ref={groupRef}>
      <Body />

      {/* Rotor mast */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.38, 6]} />
        <meshStandardMaterial color="#182530" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Main rotor — 3 blades */}
      <group ref={mainRotor} position={[0, 0.88, 0]}>
        {[0, 1, 2].map(i => (
          <mesh key={i} rotation={[0, (i / 3) * Math.PI * 2, 0]}>
            <boxGeometry args={[7.2, 0.055, 0.55]} />
            <meshStandardMaterial color="#1e3040" metalness={0.5} roughness={0.35} />
          </mesh>
        ))}
      </group>

      {/* Tail rotor — 2 blades */}
      <group ref={tailRotor} position={[-4.52, 0.52, 0.24]}>
        {[0, 1].map(i => (
          <mesh key={i} rotation={[i * Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.07, 1.3, 0.17]} />
            <meshStandardMaterial color="#1e3040" metalness={0.5} roughness={0.35} />
          </mesh>
        ))}
      </group>

      {/* Belly strobe */}
      <mesh ref={strobeRef} position={[0, -0.58, 0]}>
        <sphereGeometry args={[0.12, 5, 4]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0} />
      </mesh>
    </group>
  )
}
