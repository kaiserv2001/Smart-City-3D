import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScene } from '../SceneContext'

const ROAD_OFFSETS  = [-96, -48, 0, 48, 96]
const HALF          = 112
const CARS_PER_LANE = 3
const LANE_OFFSET   = 1.4

const CAR_COLORS = [
  '#c0c8d8', '#d8c0b8', '#b8c8b0', '#e8e0d0',
  '#2255aa', '#aa2222', '#44aa66', '#ddbb44',
  '#884422', '#226688', '#aa44aa', '#888888',
]

function seededRand(seed) {
  const x = Math.sin(seed + 1) * 43758.5453
  return x - Math.floor(x)
}

function CarMesh({ color, isDaytime }) {
  const headEI  = isDaytime ? 0.6 : 4
  const tailEI  = isDaytime ? 1.2 : 4

  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[2.8, 0.44, 1.3]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.12} metalness={0.75} roughness={0.25} />
      </mesh>
      {/* Cabin */}
      <mesh position={[-0.15, 0.62, 0]}>
        <boxGeometry args={[1.4, 0.38, 1.1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.12} metalness={0.6} roughness={0.2} transparent opacity={0.9} />
      </mesh>
      {/* Front windshield */}
      <mesh position={[0.56, 0.62, 0]}>
        <boxGeometry args={[0.05, 0.32, 1.05]} />
        <meshStandardMaterial color="#223344" metalness={0.4} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* Rear windshield */}
      <mesh position={[-0.88, 0.62, 0]}>
        <boxGeometry args={[0.05, 0.32, 1.05]} />
        <meshStandardMaterial color="#223344" metalness={0.4} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* Wheels */}
      {[[-0.85, 0, 0.68], [0.85, 0, 0.68], [-0.85, 0, -0.68], [0.85, 0, -0.68]].map((p, i) => (
        <mesh key={i} position={p} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.14, 10]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
        </mesh>
      ))}
      {/* Rims */}
      {[[-0.85, 0, 0.68], [0.85, 0, 0.68], [-0.85, 0, -0.68], [0.85, 0, -0.68]].map((p, i) => (
        <mesh key={i} position={p} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.15, 8]} />
          <meshStandardMaterial color="#555" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {/* Headlights */}
      {[[1.41, 0.26, 0.38], [1.41, 0.26, -0.38]].map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.06, 0.14, 0.22]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={headEI} />
        </mesh>
      ))}
      {/* Taillights */}
      {[[-1.41, 0.26, 0.38], [-1.41, 0.26, -0.38]].map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.06, 0.12, 0.2]} />
          <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={tailEI} />
        </mesh>
      ))}
    </group>
  )
}

export default function Cars() {
  const { isDaytime } = useScene()
  const groupRefs = useRef([])

  const cars = useMemo(() => {
    const list = []
    let seed = 0
    ROAD_OFFSETS.forEach(roadOffset => {
      ;['x', 'z'].forEach(axis => {
        ;[1, -1].forEach(dir => {
          const laneSpeed = (3.0 + seededRand(seed) * 3.5) * dir
          seed++
          for (let c = 0; c < CARS_PER_LANE; c++) {
            const startPos = -HALF + (c / CARS_PER_LANE) * HALF * 2
            const lateral  = roadOffset + dir * LANE_OFFSET
            list.push({
              axis,
              fixed: lateral,
              pos: startPos,
              speed: laneSpeed,
              color: CAR_COLORS[Math.floor(seededRand(seed + c * 7) * CAR_COLORS.length)],
              rotY: axis === 'x'
                ? (dir === 1 ? 0 : Math.PI)
                : (dir === 1 ? Math.PI / 2 : -Math.PI / 2),
            })
          }
        })
      })
    })
    return list
  }, [])

  const positions = useRef(cars.map(c => c.pos))

  useFrame((_, delta) => {
    cars.forEach((car, i) => {
      positions.current[i] += car.speed * delta
      if (positions.current[i] >  HALF) positions.current[i] = -HALF
      if (positions.current[i] < -HALF) positions.current[i] =  HALF

      const ref = groupRefs.current[i]
      if (!ref) return
      if (car.axis === 'x') {
        ref.position.set(positions.current[i], 0, car.fixed)
      } else {
        ref.position.set(car.fixed, 0, positions.current[i])
      }
    })
  })

  return (
    <group>
      {cars.map((car, i) => (
        <group
          key={i}
          ref={el => (groupRefs.current[i] = el)}
          rotation={[0, car.rotY, 0]}
        >
          <CarMesh color={car.color} isDaytime={isDaytime} />
        </group>
      ))}
    </group>
  )
}
