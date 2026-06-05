import { useMemo } from 'react'
import { useScene } from '../SceneContext'

function Road({ x, z, length, axis, isDaytime }) {
  const w   = 5
  const isX = axis === 'x'
  const rot = isX ? [-Math.PI / 2, 0, 0] : [-Math.PI / 2, 0, Math.PI / 2]

  return (
    <group>
      {/* Road surface */}
      <mesh position={[x, 0.01, z]} rotation={rot} receiveShadow>
        <planeGeometry args={[length, w]} />
        <meshStandardMaterial
          color={isDaytime ? '#363630' : '#030d1e'}
          roughness={0.95} metalness={0}
        />
      </mesh>

      {/* Centre line */}
      <mesh position={[x, 0.02, z]} rotation={rot}>
        <planeGeometry args={[length, 0.1]} />
        <meshStandardMaterial
          color={isDaytime ? '#e8e0c8' : '#00ffff'}
          emissive={isDaytime ? '#000000' : '#00ffff'}
          emissiveIntensity={isDaytime ? 0 : 2}
          roughness={0.9}
          transparent opacity={isDaytime ? 1 : 0.6}
        />
      </mesh>

      {/* Edge lines */}
      {[-1, 1].map(side => (
        <mesh
          key={side}
          position={isX
            ? [x, 0.02, z + side * (w / 2 - 0.2)]
            : [x + side * (w / 2 - 0.2), 0.02, z]}
          rotation={rot}
        >
          <planeGeometry args={[length, 0.14]} />
          <meshStandardMaterial
            color={isDaytime ? '#d0c8b0' : '#0055ff'}
            emissive={isDaytime ? '#000000' : '#0055ff'}
            emissiveIntensity={isDaytime ? 0 : 1.5}
            roughness={0.9}
            transparent opacity={isDaytime ? 1 : 0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function Roads() {
  const { isDaytime } = useScene()

  const roads = useMemo(() => {
    const list = []
    const roadLength = 250, blockSpacing = 12, gridSize = 10
    for (let i = -gridSize; i <= gridSize; i++) {
      if (i % 4 !== 0) continue
      const pos = i * blockSpacing
      list.push({ x: 0, z: pos, length: roadLength, axis: 'x' })
      list.push({ x: pos, z: 0, length: roadLength, axis: 'z' })
    }
    return list
  }, [])

  return (
    <group>
      {roads.map((r, i) => <Road key={i} {...r} isDaytime={isDaytime} />)}
    </group>
  )
}
