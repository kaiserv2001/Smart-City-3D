import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Stars, Grid } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { SceneContext } from './SceneContext'
import CityGrid from './components/CityGrid'
import Roads from './components/Roads'
import Cars from './components/Cars'
import StreetLights from './components/StreetLights'
import Trees from './components/Trees'
import TrafficLights from './components/TrafficLights'
import Pedestrians from './components/Pedestrians'
import Billboards from './components/Billboards'
import Crosswalks from './components/Crosswalks'
import EmergencyVehicles from './components/EmergencyVehicles'
import MovingClouds from './components/MovingClouds'
import Helicopter from './components/Helicopter'
import Fountain from './components/Fountain'
import LoadingScreen from './components/LoadingScreen'

function ToggleButton({ isDaytime, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: 'fixed', top: 28, left: '50%', transform: 'translateX(-50%)',
        zIndex: 20, pointerEvents: 'auto', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 22px', borderRadius: 28,
        border: isDaytime ? '1px solid rgba(60,100,140,0.3)' : '1px solid rgba(0,220,255,0.35)',
        background: isDaytime ? 'rgba(255,255,255,0.78)' : 'rgba(0,12,30,0.82)',
        backdropFilter: 'blur(10px)',
        color: isDaytime ? '#1a3a5a' : '#00eeff',
        fontFamily: 'system-ui, sans-serif',
        fontSize: 11, fontWeight: 600, letterSpacing: 2,
        transition: 'all 0.3s ease',
        boxShadow: isDaytime
          ? '0 2px 12px rgba(0,0,0,0.12)'
          : '0 0 20px rgba(0,200,255,0.2)',
      }}
    >
      <span style={{ fontSize: 16 }}>{isDaytime ? '🌙' : '☀️'}</span>
      {isDaytime ? 'NIGHT MODE' : 'DAY MODE'}
    </button>
  )
}

function HUD({ isDaytime }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1800)
    return () => clearInterval(id)
  }, [])

  const night = !isDaytime
  const stats = [
    { label: 'POPULATION',    value: (842_300 + tick * 12).toLocaleString() },
    { label: 'ACTIVE ROUTES', value: tick % 2 === 0 ? '1,284' : '1,291' },
    { label: 'AIR QUALITY',   value: 'GOOD — 42 AQI' },
    { label: 'TEMP',          value: '24 °C  / 75 °F' },
  ]

  const titleColor   = night ? '#ffffff'           : '#1a2a3a'
  const subtitleColor = night ? '#00eeff'          : '#3a5a7a'
  const lineColor    = night ? '#00eeff'           : '#3a7aaa'
  const panelBg      = night ? 'rgba(0,12,30,0.82)': 'rgba(255,255,255,0.72)'
  const panelBorder  = night ? 'rgba(0,220,255,0.25)': 'rgba(60,100,140,0.2)'
  const labelColor   = night ? '#4af8'             : '#6a8aaa'
  const valueColor   = night ? '#00eeff'           : '#1a3a5a'
  const coordColor   = night ? '#00eeff55'         : '#1a3a5a99'

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10, fontFamily: 'system-ui, sans-serif' }}>
      {/* Title */}
      <div style={{ position: 'absolute', top: 28, left: 36 }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, color: titleColor,
          textShadow: night ? '0 0 20px rgba(0,200,255,0.4)' : '0 1px 3px rgba(255,255,255,0.8)' }}>
          SMART CITY
        </div>
        <div style={{ fontSize: 10, color: subtitleColor, letterSpacing: 3, marginTop: 3 }}>
          URBAN INTELLIGENCE PLATFORM
        </div>
        <div style={{ width: 200, height: 2, background: `linear-gradient(90deg,${lineColor},transparent)`, marginTop: 8, borderRadius: 1 }} />
      </div>

      {/* Stats panel */}
      <div style={{
        position: 'absolute', top: 28, right: 36,
        background: panelBg, backdropFilter: 'blur(10px)',
        border: `1px solid ${panelBorder}`, borderRadius: 8,
        padding: '14px 20px', minWidth: 210,
        boxShadow: night ? '0 0 24px rgba(0,200,255,0.12)' : '0 4px 20px rgba(0,0,0,0.12)',
      }}>
        <div style={{ fontSize: 9, color: subtitleColor, letterSpacing: 3, marginBottom: 12, fontWeight: 600 }}>CITY DASHBOARD</div>
        {stats.map(s => (
          <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 9 }}>
            <span style={{ fontSize: 9, color: labelColor, letterSpacing: 1 }}>{s.label}</span>
            <span style={{ fontSize: 10, color: valueColor, fontWeight: 700 }}>{s.value}</span>
          </div>
        ))}
        <div style={{ width: '100%', height: 1, background: panelBorder, margin: '8px 0 6px' }} />
        <div style={{ fontSize: 9, color: subtitleColor, letterSpacing: 1 }}>
          {tick % 3 === 0 ? '● Live data' : tick % 3 === 1 ? '● Updating...' : '● All systems normal'}
        </div>
      </div>

      {/* Coordinates */}
      <div style={{ position: 'absolute', bottom: 28, left: 36, color: coordColor, fontSize: 9, letterSpacing: 2 }}>
        <div>LAT 40.7128° N  |  LON 74.0060° W</div>
        <div style={{ marginTop: 4 }}>ZONE 7 — SECTOR 4C</div>
      </div>

      {/* Controls */}
      <div style={{ position: 'absolute', bottom: 28, right: 36, color: coordColor, fontSize: 9, letterSpacing: 2, textAlign: 'right' }}>
        {['DRAG — ROTATE', 'SCROLL — ZOOM', 'RIGHT DRAG — PAN'].map(t => (
          <div key={t} style={{ marginTop: 4 }}>{t}</div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [ready, setReady]         = useState(false)
  const [isDaytime, setIsDaytime] = useState(true)

  return (
    <SceneContext.Provider value={{ isDaytime }}>
      {!ready && <LoadingScreen isDaytime={isDaytime} />}

      {ready && <ToggleButton isDaytime={isDaytime} onToggle={() => setIsDaytime(d => !d)} />}
      {ready && <HUD isDaytime={isDaytime} />}

      <Canvas
        camera={{ position: [55, 35, 55], fov: 50 }}
        gl={{ antialias: true }}
        shadows
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = isDaytime ? 1.0 : 1.4
          setTimeout(() => setReady(true), 1400)
        }}
      >
        {/* Sky / atmosphere */}
        <color attach="background" args={[isDaytime ? '#a8c8f0' : '#000814']} />

{isDaytime
          ? <Sky distance={450000} sunPosition={[80, 55, 40]} turbidity={5} rayleigh={1.2} mieCoefficient={0.003} mieDirectionalG={0.88} />
          : <Stars radius={220} depth={60} count={4000} factor={3} fade speed={0.4} />
        }

        {/* ── DAY LIGHTING ── */}
        {isDaytime && <>
          <directionalLight
            position={[80, 55, 40]} intensity={3.8} color="#fff8ee" castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={350}
            shadow-camera-left={-160} shadow-camera-right={160}
            shadow-camera-top={160}  shadow-camera-bottom={-160}
            shadow-bias={-0.0005}
          />
          <hemisphereLight args={['#a8c8f8', '#5a7040', 1.6]} />
          <directionalLight position={[-40, 20, -30]} intensity={0.6} color="#c8d8f0" />
        </>}

        {/* ── NIGHT LIGHTING ── */}
        {!isDaytime && <>
          <hemisphereLight args={['#334466', '#112244', 1.8]} />
          <ambientLight intensity={1.2} color="#aabbdd" />
          <directionalLight position={[60, 80, 40]} intensity={2.5} color="#ffffff" />
          <directionalLight position={[-40, 50, -30]} intensity={1.2} color="#88aaff" />
          <pointLight position={[0, 40, 0]} intensity={8} color="#aaccff" distance={220} />
        </>}

        <Suspense fallback={null}>
          <CityGrid />
          <Roads />
          <Cars />
          <StreetLights />
          <Trees />
          <TrafficLights />
          <Pedestrians />
          <Crosswalks />
          <EmergencyVehicles />
          <Billboards />
          <Fountain />
          <Helicopter />
          {isDaytime && <MovingClouds />}

          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
            <planeGeometry args={[500, 500]} />
            <meshStandardMaterial
              color={isDaytime ? '#7a7868' : '#000c1e'}
              roughness={0.95} metalness={0}
            />
          </mesh>

          <Grid
            position={[0, 0.01, 0]}
            cellSize={6}
            cellThickness={isDaytime ? 0.3 : 0.4}
            cellColor={isDaytime ? '#6a6858' : '#001830'}
            sectionSize={24}
            sectionThickness={isDaytime ? 0.6 : 1}
            sectionColor={isDaytime ? '#5a584a' : '#003366'}
            fadeDistance={160}
            fadeStrength={2}
            infiniteGrid
          />
        </Suspense>

        <OrbitControls
          enablePan enableZoom enableRotate
          minDistance={12} maxDistance={200}
          maxPolarAngle={Math.PI / 2.1}
          autoRotate autoRotateSpeed={0.25}
          target={[0, 6, 0]}
        />

        <EffectComposer multisampling={0}>
          <Bloom
            luminanceThreshold={isDaytime ? 0.92 : 0.65}
            luminanceSmoothing={0.04}
            intensity={isDaytime ? 0.18 : 0.7}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </SceneContext.Provider>
  )
}
