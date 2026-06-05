import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScene } from '../SceneContext'

// Heli 1 — outer orbit, clockwise, dark blue-grey
const H1 = { radius: 52, altitude: 62, speed: 0.09,  color: '#2a3a4a', phase: 0 }
// Heli 2 — inner orbit, counter-clockwise, olive-green livery
const H2 = { radius: 34, altitude: 52, speed: -0.13, color: '#3a4430', phase: Math.PI }

function Body({ color }) {
  return (
    <group>
      {/* Main fuselage */}
      <mesh>
        <boxGeometry args={[4.4, 1.0, 1.3]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
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
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Tail fin */}
      <mesh position={[-4.4, 0.55, 0]}>
        <boxGeometry args={[0.3, 1.0, 0.1]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
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

function HeliInstance({ cfg, strobeOffset = 0, onSelect }) {
  const groupRef  = useRef()
  const mainRotor = useRef()
  const tailRotor = useRef()
  const strobeRef = useRef()

  useFrame((state, delta) => {
    const t     = state.clock.elapsedTime
    const angle = t * cfg.speed + cfg.phase

    groupRef.current.position.set(
      Math.cos(angle) * cfg.radius,
      cfg.altitude + Math.sin(t * 0.25 + cfg.phase) * 3,
      Math.sin(angle) * cfg.radius,
    )
    // Nose follows tangent — negate speed sign so it always faces forward
    const tangentAngle = angle + (cfg.speed < 0 ? Math.PI / 2 : -Math.PI / 2)
    groupRef.current.rotation.y = tangentAngle

    if (mainRotor.current) mainRotor.current.rotation.y += delta * 18
    if (tailRotor.current) tailRotor.current.rotation.x += delta * 24

    if (strobeRef.current) {
      strobeRef.current.material.emissiveIntensity =
        Math.floor((t + strobeOffset) * 2) % 2 === 0 ? 9 : 0
    }
  })

  return (
    <group ref={groupRef}
      onClick={(e) => { e.stopPropagation(); onSelect?.() }}
      onPointerEnter={() => { document.body.style.cursor = 'pointer' }}
      onPointerLeave={() => { document.body.style.cursor = 'auto' }}
    >
      <Body color={cfg.color} />

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

export default function Helicopter() {
  const { setSelected } = useScene()
  return (
    <group>
      <HeliInstance cfg={H1} strobeOffset={0}
        onSelect={() => setSelected({ type: 'helicopter', data: H1 })} />
      <HeliInstance cfg={H2} strobeOffset={0.5}
        onSelect={() => setSelected({ type: 'helicopter', data: H2 })} />
    </group>
  )
}
