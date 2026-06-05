import { useEffect, useState } from 'react'

const PHASES = [
  'Initializing neural grid',
  'Mapping urban topology',
  'Calibrating sensor arrays',
  'Loading city infrastructure',
  'Syncing data streams',
  'Launching urban intelligence',
]

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let p = 0
    const id = setInterval(() => {
      p += Math.random() * 15
      if (p >= 100) { p = 100; clearInterval(id) }
      setProgress(Math.floor(p))
    }, 110)
    return () => clearInterval(id)
  }, [])

  const phase = PHASES[Math.min(Math.floor((progress / 100) * PHASES.length), PHASES.length - 1)]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'linear-gradient(160deg, #d0e8f8 0%, #b8d4ee 50%, #c8ddf0 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.07,
        backgroundImage: 'linear-gradient(#3a6a9a 1px,transparent 1px),linear-gradient(90deg,#3a6a9a 1px,transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <div style={{ position: 'relative', textAlign: 'center', width: 380, padding: '0 28px' }}>
        <div style={{ fontSize: 11, color: '#3a6a9a', letterSpacing: 5, marginBottom: 14, fontWeight: 500 }}>
          URBAN INTELLIGENCE PLATFORM
        </div>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 6, color: '#1a3a5a', marginBottom: 4 }}>
          SMART CITY
        </div>
        <div style={{
          width: '55%', height: 2,
          background: 'linear-gradient(90deg,transparent,#3a7aaa,transparent)',
          margin: '14px auto 28px', borderRadius: 1,
        }} />

        {/* Progress bar */}
        <div style={{
          width: '100%', height: 4, background: 'rgba(60,100,150,0.15)',
          borderRadius: 4, overflow: 'hidden', marginBottom: 14,
        }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'linear-gradient(90deg,#3a7aaa,#5aaad8)',
            transition: 'width 0.1s ease', borderRadius: 4,
            boxShadow: '0 0 8px rgba(58,122,170,0.5)',
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#4a7aaa', letterSpacing: 1 }}>{phase}...</span>
          <span style={{ fontSize: 20, color: '#1a4a7a', fontWeight: 700 }}>{progress}%</span>
        </div>
      </div>
    </div>
  )
}
