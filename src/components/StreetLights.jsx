import { useMemo } from 'react'
import { useScene } from '../SceneContext'

const ROAD_OFFSETS = [-96, -48, 0, 48, 96]
const SPACING = 28
const HALF = 108

function StreetLight({ position, rotY, isDaytime }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Pole */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.07, 0.1, 6, 6]} />
        <meshStandardMaterial color="#2a3a4a" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Curved neck */}
      <mesh position={[0.5, 5.7, 0]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.045, 0.045, 1.4, 5]} />
        <meshStandardMaterial color="#2a3a4a" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Lamp housing */}
      <mesh position={[1.1, 5.3, 0]}>
        <boxGeometry args={[0.5, 0.18, 0.32]} />
        <meshStandardMaterial color="#1a2a36" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Glowing bulb — dim in day, bright at night */}
      <mesh position={[1.1, 5.15, 0]}>
        <sphereGeometry args={[0.11, 7, 6]} />
        <meshStandardMaterial
          color="#fff8cc"
          emissive="#ffeeaa"
          emissiveIntensity={isDaytime ? 0.4 : 5}
        />
      </mesh>
      {/* Light cone hint — only visible at night */}
      <mesh position={[1.1, 5.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 12]} />
        <meshStandardMaterial
          color="#ffffaa" emissive="#ffffaa"
          emissiveIntensity={isDaytime ? 0 : 2}
          transparent opacity={isDaytime ? 0 : 0.18}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

export default function StreetLights() {
  const { isDaytime } = useScene()

  const lights = useMemo(() => {
    const list = []
    ROAD_OFFSETS.forEach(roadPos => {
      for (let p = -HALF; p <= HALF; p += SPACING) {
        list.push({ pos: [p, 0, roadPos + 3.8], rotY: Math.PI })
        list.push({ pos: [p, 0, roadPos - 3.8], rotY: 0 })
        list.push({ pos: [roadPos + 3.8, 0, p], rotY: -Math.PI / 2 })
        list.push({ pos: [roadPos - 3.8, 0, p], rotY:  Math.PI / 2 })
      }
    })
    return list
  }, [])

  const intersectionLights = useMemo(() => {
    const pts = []
    ;[-48, 0, 48].forEach(x => [-48, 0, 48].forEach(z => pts.push([x, 8, z])))
    return pts
  }, [])

  return (
    <group>
      {lights.map((l, i) => (
        <StreetLight key={i} position={l.pos} rotY={l.rotY} isDaytime={isDaytime} />
      ))}
      {intersectionLights.map((pos, i) => (
        <pointLight
          key={i} position={pos}
          color="#ffeeaa"
          intensity={isDaytime ? 0 : 5}
          distance={40}
        />
      ))}
    </group>
  )
}
