import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useScene } from '../SceneContext'

const ROAD_OFFSETS = [0, 48, 96, -48, -96]
const ROAD_W       = 5
const N_STRIPES    = 4
const STRIPE_W     = 0.30
const SPACING      = 0.50   // centre-to-centre between stripes
const SIDE_OFFSET  = ROAD_W / 2 + (N_STRIPES * SPACING) / 2 + 0.15

// Build flat instance positions for two orientations
function buildInstances() {
  // ns → stripes span road width in X, offset in Z  (for N/S sides of intersection)
  // ew → stripes span road width in Z, offset in X  (for E/W sides)
  const ns = [], ew = []

  ROAD_OFFSETS.forEach(xr => {
    ROAD_OFFSETS.forEach(zr => {
      // North & South crosswalks
      ;[-1, 1].forEach(side => {
        const baseZ = zr + side * SIDE_OFFSET
        for (let i = 0; i < N_STRIPES; i++) {
          const zo = (i - (N_STRIPES - 1) / 2) * SPACING
          ns.push([xr, 0.024, baseZ + zo])
        }
      })
      // West & East crosswalks
      ;[-1, 1].forEach(side => {
        const baseX = xr + side * SIDE_OFFSET
        for (let i = 0; i < N_STRIPES; i++) {
          const xo = (i - (N_STRIPES - 1) / 2) * SPACING
          ew.push([baseX + xo, 0.024, zr])
        }
      })
    })
  })

  return { ns, ew }
}

function StripeInstances({ positions, geomW, geomH, isDaytime }) {
  const ref = useRef()

  useEffect(() => {
    if (!ref.current) return
    const dummy = new THREE.Object3D()
    positions.forEach(([x, y, z], i) => {
      dummy.position.set(x, y, z)
      dummy.rotation.set(-Math.PI / 2, 0, 0)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [positions])

  return (
    <instancedMesh ref={ref} args={[null, null, positions.length]}>
      <planeGeometry args={[geomW, geomH]} />
      <meshStandardMaterial
        color={isDaytime ? '#d4ccb0' : '#00ccff'}
        emissive={isDaytime ? '#000000' : '#00ccff'}
        emissiveIntensity={isDaytime ? 0 : 0.45}
        roughness={0.88}
        metalness={0}
      />
    </instancedMesh>
  )
}

export default function Crosswalks() {
  const { isDaytime } = useScene()
  const { ns, ew }    = useMemo(() => buildInstances(), [])

  return (
    <group>
      {/* N/S sides: stripe spans ROAD_W in X, thin in Z */}
      <StripeInstances positions={ns} geomW={ROAD_W} geomH={STRIPE_W} isDaytime={isDaytime} />
      {/* E/W sides: stripe spans ROAD_W in Z, thin in X */}
      <StripeInstances positions={ew} geomW={STRIPE_W} geomH={ROAD_W} isDaytime={isDaytime} />
    </group>
  )
}
