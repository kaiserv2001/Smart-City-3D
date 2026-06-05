import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
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

// Module-level reusables to avoid GC pressure in useFrame
const _dummy = new THREE.Object3D()
const _color = new THREE.Color()

function setPart(mesh, idx, worldX, worldZ, rotY, cos, sin, lx, ly, lz, sx, sy, sz, rotX = 0) {
  _dummy.position.set(worldX + lx * cos - lz * sin, ly, worldZ + lx * sin + lz * cos)
  if (rotX !== 0) {
    _dummy.rotation.set(rotX, rotY, 0, 'YXZ')
  } else {
    _dummy.rotation.set(0, rotY, 0)
  }
  _dummy.scale.set(sx, sy, sz)
  _dummy.updateMatrix()
  mesh.setMatrixAt(idx, _dummy.matrix)
}

const WHEEL_LOCALS = [[-0.85, 0, 0.68], [0.85, 0, 0.68], [-0.85, 0, -0.68], [0.85, 0, -0.68]]

export default function Cars() {
  const { isDaytime, setSelected } = useScene()

  const cars = useMemo(() => {
    const list = []
    let seed = 0
    ROAD_OFFSETS.forEach(roadOffset => {
      ;['x', 'z'].forEach(axis => {
        ;[1, -1].forEach(dir => {
          const laneSpeed = (3.0 + seededRand(seed) * 3.5) * dir
          seed++
          for (let c = 0; c < CARS_PER_LANE; c++) {
            const colorStr = CAR_COLORS[Math.floor(seededRand(seed + c * 7) * CAR_COLORS.length)]
            list.push({
              axis,
              fixed: roadOffset + dir * LANE_OFFSET,
              pos:   -HALF + (c / CARS_PER_LANE) * HALF * 2,
              speed: laneSpeed,
              colorStr,
              rotY:  axis === 'x'
                ? (dir === 1 ? 0 : Math.PI)
                : (dir === 1 ? Math.PI / 2 : -Math.PI / 2),
            })
          }
        })
      })
    })
    return list
  }, [])

  const n = cars.length
  const positions = useRef(cars.map(c => c.pos))

  const bodyRef  = useRef()
  const cabinRef = useRef()
  const windRef  = useRef()
  const wheelRef = useRef()
  const rimRef   = useRef()
  const headRef  = useRef()
  const tailRef  = useRef()

  // Set per-instance body/cabin colors once
  useEffect(() => {
    cars.forEach((car, i) => {
      _color.set(car.colorStr)
      bodyRef.current?.setColorAt(i, _color)
      cabinRef.current?.setColorAt(i, _color)
    })
    if (bodyRef.current?.instanceColor)  bodyRef.current.instanceColor.needsUpdate = true
    if (cabinRef.current?.instanceColor) cabinRef.current.instanceColor.needsUpdate = true
  }, [cars])

  useFrame((_, delta) => {
    const B  = bodyRef.current
    const CA = cabinRef.current
    const W  = windRef.current
    const WH = wheelRef.current
    const RI = rimRef.current
    const HL = headRef.current
    const TL = tailRef.current
    if (!B || !CA || !W || !WH || !RI || !HL || !TL) return

    cars.forEach((car, i) => {
      positions.current[i] += car.speed * delta
      if (positions.current[i] >  HALF) positions.current[i] = -HALF
      if (positions.current[i] < -HALF) positions.current[i] =  HALF

      const wx   = car.axis === 'x' ? positions.current[i] : car.fixed
      const wz   = car.axis === 'z' ? positions.current[i] : car.fixed
      const rotY = car.rotY
      const cos  = Math.cos(rotY), sin = Math.sin(rotY)

      setPart(B,  i,     wx, wz, rotY, cos, sin,  0,     0.22, 0,      2.8,  0.44, 1.3)
      setPart(CA, i,     wx, wz, rotY, cos, sin, -0.15,  0.62, 0,      1.4,  0.38, 1.1)
      setPart(W,  2*i,   wx, wz, rotY, cos, sin,  0.56,  0.62, 0,      0.05, 0.32, 1.05)
      setPart(W,  2*i+1, wx, wz, rotY, cos, sin, -0.88,  0.62, 0,      0.05, 0.32, 1.05)

      WHEEL_LOCALS.forEach(([lx, ly, lz], wi) => {
        setPart(WH, 4*i+wi, wx, wz, rotY, cos, sin, lx, 0.22 + ly, lz, 1, 1, 1, Math.PI/2)
        setPart(RI, 4*i+wi, wx, wz, rotY, cos, sin, lx, 0.22 + ly, lz, 1, 1, 1, Math.PI/2)
      })

      setPart(HL, 2*i,   wx, wz, rotY, cos, sin,  1.41, 0.26,  0.38, 0.06, 0.14, 0.22)
      setPart(HL, 2*i+1, wx, wz, rotY, cos, sin,  1.41, 0.26, -0.38, 0.06, 0.14, 0.22)
      setPart(TL, 2*i,   wx, wz, rotY, cos, sin, -1.41, 0.26,  0.38, 0.06, 0.12, 0.20)
      setPart(TL, 2*i+1, wx, wz, rotY, cos, sin, -1.41, 0.26, -0.38, 0.06, 0.12, 0.20)
    })

    B.instanceMatrix.needsUpdate  = true
    CA.instanceMatrix.needsUpdate = true
    W.instanceMatrix.needsUpdate  = true
    WH.instanceMatrix.needsUpdate = true
    RI.instanceMatrix.needsUpdate = true
    HL.instanceMatrix.needsUpdate = true
    TL.instanceMatrix.needsUpdate = true
  })

  const headEI = isDaytime ? 0.6 : 4
  const tailEI = isDaytime ? 1.2 : 4

  function onCarClick(e) {
    e.stopPropagation()
    const car = cars[e.instanceId]
    if (car) setSelected({ type: 'car', data: car })
  }

  function onEnter() { document.body.style.cursor = 'pointer' }
  function onLeave() { document.body.style.cursor = 'auto' }

  return (
    <group>
      {/* Body — colored per instance, clickable */}
      <instancedMesh ref={bodyRef} args={[null, null, n]}
        onClick={onCarClick} onPointerEnter={onEnter} onPointerLeave={onLeave}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.75} roughness={0.25} />
      </instancedMesh>

      {/* Cabin — same color as body */}
      <instancedMesh ref={cabinRef} args={[null, null, n]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.6} roughness={0.2} transparent opacity={0.9} />
      </instancedMesh>

      {/* Windshields (front + rear, 2 per car) */}
      <instancedMesh ref={windRef} args={[null, null, n * 2]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#223344" metalness={0.4} roughness={0.1} transparent opacity={0.7} />
      </instancedMesh>

      {/* Wheels (4 per car) */}
      <instancedMesh ref={wheelRef} args={[null, null, n * 4]}>
        <cylinderGeometry args={[0.22, 0.22, 0.14, 8]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </instancedMesh>

      {/* Rims (4 per car) */}
      <instancedMesh ref={rimRef} args={[null, null, n * 4]}>
        <cylinderGeometry args={[0.12, 0.12, 0.15, 6]} />
        <meshStandardMaterial color="#555555" metalness={0.9} roughness={0.2} />
      </instancedMesh>

      {/* Headlights (2 per car) */}
      <instancedMesh ref={headRef} args={[null, null, n * 2]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={headEI} />
      </instancedMesh>

      {/* Taillights (2 per car) */}
      <instancedMesh ref={tailRef} args={[null, null, n * 2]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={tailEI} />
      </instancedMesh>
    </group>
  )
}
