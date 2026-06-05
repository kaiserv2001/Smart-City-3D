import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function ScanRing() {
  const groupRef = useRef()
  const matRef = useRef()

  useFrame(({ clock }) => {
    const y = (clock.elapsedTime * 7) % 55
    groupRef.current.position.y = y
    matRef.current.opacity = 0.18 * (1 - y / 55)
  })

  return (
    <group ref={groupRef} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Filled sweep disc */}
      <mesh>
        <ringGeometry args={[0, 170, 96]} />
        <meshBasicMaterial ref={matRef} color="#00ffff" transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* Hard leading edge ring */}
      <mesh>
        <ringGeometry args={[168, 170, 96]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  )
}
