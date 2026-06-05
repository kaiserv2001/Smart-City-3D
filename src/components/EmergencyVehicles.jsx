import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const HALF = 112

// ── Ambulance ─────────────────────────────────────────────────────────────────

function AmbulanceBody() {
  return (
    <group>
      {/* Main van body */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[3.6, 1.1, 1.6]} />
        <meshStandardMaterial color="#f0f0ee" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Raised roof box */}
      <mesh position={[-0.2, 1.3, 0]}>
        <boxGeometry args={[2.6, 0.55, 1.45]} />
        <meshStandardMaterial color="#f0f0ee" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Cab windshield */}
      <mesh position={[1.82, 0.72, 0]}>
        <boxGeometry args={[0.06, 0.7, 1.42]} />
        <meshStandardMaterial color="#88aacc" transparent opacity={0.5} roughness={0.05} />
      </mesh>
      {/* Red stripe along side */}
      <mesh position={[0, 0.55, 0.81]}>
        <boxGeometry args={[3.6, 0.2, 0.02]} />
        <meshStandardMaterial color="#cc1111" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.55, -0.81]}>
        <boxGeometry args={[3.6, 0.2, 0.02]} />
        <meshStandardMaterial color="#cc1111" roughness={0.5} />
      </mesh>
      {/* Wheels */}
      {[[-1.1, 0, 0.86], [1.1, 0, 0.86], [-1.1, 0, -0.86], [1.1, 0, -0.86]].map((p, i) => (
        <mesh key={i} position={p} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.16, 10]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
        </mesh>
      ))}
      {/* Headlights */}
      {[[1.81, 0.5, 0.5], [1.81, 0.5, -0.5]].map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.06, 0.18, 0.28]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.5} />
        </mesh>
      ))}
    </group>
  )
}

// ── Police car ────────────────────────────────────────────────────────────────

function PoliceBody() {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[2.9, 0.44, 1.35]} />
        <meshStandardMaterial color="#111a2a" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Cabin */}
      <mesh position={[-0.1, 0.62, 0]}>
        <boxGeometry args={[1.45, 0.38, 1.12]} />
        <meshStandardMaterial color="#111a2a" metalness={0.5} roughness={0.2} />
      </mesh>
      {/* Front windshield */}
      <mesh position={[0.62, 0.62, 0]}>
        <boxGeometry args={[0.06, 0.32, 1.06]} />
        <meshStandardMaterial color="#334455" transparent opacity={0.7} roughness={0.1} />
      </mesh>
      {/* White door panels */}
      {[-0.82, 0.82].map((sz, i) => (
        <mesh key={i} position={[0, 0.26, sz]}>
          <boxGeometry args={[1.8, 0.3, 0.02]} />
          <meshStandardMaterial color="#e8e8e0" roughness={0.6} />
        </mesh>
      ))}
      {/* Wheels */}
      {[[-0.88, 0, 0.72], [0.88, 0, 0.72], [-0.88, 0, -0.72], [0.88, 0, -0.72]].map((p, i) => (
        <mesh key={i} position={p} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.14, 10]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
        </mesh>
      ))}
      {/* Headlights */}
      {[[1.46, 0.26, 0.42], [1.46, 0.26, -0.42]].map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.06, 0.14, 0.22]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.5} />
        </mesh>
      ))}
    </group>
  )
}

// ── Light bar (shared) ────────────────────────────────────────────────────────

function LightBar({ redRef, blueRef, barY }) {
  return (
    <group position={[0, barY, 0]}>
      {/* Bar housing */}
      <mesh>
        <boxGeometry args={[1.4, 0.14, 0.24]} />
        <meshStandardMaterial color="#222222" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Red light */}
      <mesh ref={redRef} position={[0.38, 0, 0]}>
        <boxGeometry args={[0.3, 0.12, 0.2]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={0.5} />
      </mesh>
      {/* Blue light */}
      <mesh ref={blueRef} position={[-0.38, 0, 0]}>
        <boxGeometry args={[0.3, 0.12, 0.2]} />
        <meshStandardMaterial color="#0044ff" emissive="#0044ff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EmergencyVehicles() {
  const ambRef  = useRef()
  const ambRed  = useRef()
  const ambBlue = useRef()
  const ambPos  = useRef(-HALF)

  const polRef  = useRef()
  const polRed  = useRef()
  const polBlue = useRef()
  const polPos  = useRef(HALF)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    // Ambulance — centre of z=48 road going +x (regular lanes are at z=46.6 and z=49.4)
    ambPos.current += delta * 10
    if (ambPos.current > HALF) ambPos.current = -HALF
    if (ambRef.current) ambRef.current.position.set(ambPos.current, 0, 48)

    // Police — centre of x=-48 road going -z (regular lanes are at x=-46.6 and x=-49.4)
    polPos.current -= delta * 12
    if (polPos.current < -HALF) polPos.current = HALF
    if (polRef.current) polRef.current.position.set(-48, 0, polPos.current)

    // Flash lights at 3 Hz, alternating red/blue
    const flash = Math.floor(t * 6) % 2 === 0
    const hi = 9, lo = 0.3
    ;[ambRed, polRed].forEach(r => {
      if (r.current) r.current.material.emissiveIntensity = flash ? hi : lo
    })
    ;[ambBlue, polBlue].forEach(b => {
      if (b.current) b.current.material.emissiveIntensity = flash ? lo : hi
    })
  })

  return (
    <group>
      {/* Ambulance — faces +x */}
      <group ref={ambRef} rotation={[0, 0, 0]}>
        <AmbulanceBody />
        <LightBar redRef={ambRed} blueRef={ambBlue} barY={1.62} />
      </group>

      {/* Police — faces -z */}
      <group ref={polRef} rotation={[0, -Math.PI / 2, 0]}>
        <PoliceBody />
        <LightBar redRef={polRed} blueRef={polBlue} barY={0.85} />
      </group>
    </group>
  )
}
