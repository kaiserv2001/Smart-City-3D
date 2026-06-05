import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Particles({ count = 400 }) {
  const ref = useRef()

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 220
      positions[i * 3 + 1] = Math.random() * 60
      positions[i * 3 + 2] = (Math.random() - 0.5) * 220
      speeds[i] = 0.8 + Math.random() * 1.5
    }
    return { positions, speeds }
  }, [count])

  useFrame((_, delta) => {
    const pos = ref.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += delta * speeds[i]
      if (pos[i * 3 + 1] > 65) pos[i * 3 + 1] = 0
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#00ffff" size={0.25} transparent opacity={0.55} sizeAttenuation />
    </points>
  )
}
