import { useScene } from '../SceneContext'

const TYPE_NAMES = ['Glass Tower', 'Concrete Block', 'Corporate Complex', 'Brick Building', 'Residential Tower']

function directionFromRotY(rotY) {
  if (rotY === 0)           return 'EAST'
  if (Math.abs(rotY - Math.PI)  < 0.01) return 'WEST'
  if (rotY > 0)             return 'SOUTH'
  return 'NORTH'
}

export default function InfoPanel() {
  const { selected, setSelected, isDaytime } = useScene()
  if (!selected) return null

  const night = !isDaytime
  const bg          = night ? 'rgba(0,12,30,0.92)'       : 'rgba(255,255,255,0.92)'
  const border      = night ? 'rgba(0,220,255,0.28)'     : 'rgba(60,100,140,0.2)'
  const titleColor  = night ? '#00eeff'                  : '#1a3a5a'
  const textColor   = night ? '#cceeff'                  : '#1a3a5a'
  const labelColor  = night ? 'rgba(100,200,255,0.55)'   : '#6a8aaa'
  const shadow      = night ? '0 0 30px rgba(0,200,255,0.18)' : '0 4px 24px rgba(0,0,0,0.13)'
  const divider     = night ? 'rgba(0,200,255,0.15)'     : 'rgba(60,100,140,0.12)'

  let title = ''
  let badge = ''
  let rows  = []
  let extra = null

  if (selected.type === 'building') {
    const { data: bld } = selected
    const name     = TYPE_NAMES[bld.typeIdx] ?? 'Building'
    const floors   = Math.ceil(bld.totalH / 3.2)
    const occupancy = Math.round(55 + Math.abs((bld.x * 13 + bld.z * 7) % 40))
    const power    = Math.round(80 + bld.totalH * 2.4)
    title = name
    badge = 'STRUCTURE'
    rows  = [
      { label: 'HEIGHT',    value: `${bld.totalH.toFixed(0)} m` },
      { label: 'FLOORS',    value: floors },
      { label: 'OCCUPANCY', value: `${occupancy}%` },
      { label: 'POWER',     value: `${power} kW` },
      { label: 'COORDS',    value: `${bld.x.toFixed(0)}, ${bld.z.toFixed(0)}` },
    ]
  } else if (selected.type === 'car') {
    const { data: car } = selected
    const speedKmh = (Math.abs(car.speed) * 6).toFixed(0)
    title = 'CIVILIAN VEHICLE'
    badge = 'TRAFFIC'
    rows  = [
      { label: 'SPEED',     value: `${speedKmh} km/h` },
      { label: 'HEADING',   value: directionFromRotY(car.rotY) },
      { label: 'LANE AXIS', value: car.axis.toUpperCase() },
      { label: 'STATUS',    value: 'IN TRANSIT' },
    ]
    extra = (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, marginBottom: 4 }}>
        <span style={{ fontSize: 9, color: labelColor, letterSpacing: 1 }}>VEHICLE COLOR</span>
        <div style={{
          marginLeft: 'auto',
          width: 22, height: 13, borderRadius: 3,
          background: car.colorStr,
          border: `1px solid ${border}`,
        }} />
      </div>
    )
  } else if (selected.type === 'emergency') {
    const isAmb = selected.data.vehicleType === 'ambulance'
    title = isAmb ? 'AMBULANCE' : 'POLICE UNIT'
    badge = 'EMERGENCY'
    rows  = [
      { label: 'UNIT ID',   value: isAmb ? 'MED-04'  : 'PD-117' },
      { label: 'STATUS',    value: 'RESPONDING' },
      { label: 'SPEED',     value: isAmb ? '62 km/h' : '74 km/h' },
      { label: 'PRIORITY',  value: 'CODE 3' },
    ]
  } else if (selected.type === 'helicopter') {
    const { data } = selected
    const isOuter = data.radius > 40
    title = isOuter ? 'SURVEILLANCE HELI' : 'PATROL HELI'
    badge = 'AIRSPACE'
    rows  = [
      { label: 'CALL SIGN', value: isOuter ? 'SKY-1' : 'AIR-7' },
      { label: 'ALTITUDE',  value: `${data.altitude} m` },
      { label: 'ORBIT R',   value: `${data.radius} m` },
      { label: 'STATUS',    value: 'AIRBORNE' },
    ]
  }

  const badgeColor = {
    STRUCTURE: '#4a90d9',
    TRAFFIC:   '#44bb66',
    EMERGENCY: '#dd4444',
    AIRSPACE:  '#9955dd',
  }[badge] ?? '#888'

  return (
    <div style={{
      position: 'fixed', top: 110, right: 36, zIndex: 20, pointerEvents: 'auto',
      background: bg, backdropFilter: 'blur(14px)',
      border: `1px solid ${border}`, borderRadius: 10,
      padding: '15px 20px', minWidth: 210,
      boxShadow: shadow,
      fontFamily: 'system-ui, sans-serif',
      animation: 'infoPanelIn 0.14s ease',
    }}>
      <style>{`
        @keyframes infoPanelIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97) }
          to   { opacity: 1; transform: translateY(0)   scale(1)    }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{
            display: 'inline-block', fontSize: 8, fontWeight: 700, letterSpacing: 1.5,
            color: badgeColor, border: `1px solid ${badgeColor}44`,
            borderRadius: 3, padding: '1px 6px', marginBottom: 5,
          }}>{badge}</div>
          <div style={{ fontSize: 11, color: titleColor, letterSpacing: 2, fontWeight: 700 }}>{title}</div>
        </div>
        <button
          onClick={() => setSelected(null)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: labelColor, fontSize: 15, lineHeight: 1, padding: '0 0 0 10px',
            flexShrink: 0,
          }}
        >✕</button>
      </div>

      <div style={{ width: '100%', height: 1, background: divider, marginBottom: 10 }} />

      {/* Rows */}
      {rows.map(r => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 7 }}>
          <span style={{ fontSize: 9, color: labelColor, letterSpacing: 1 }}>{r.label}</span>
          <span style={{ fontSize: 10, color: textColor, fontWeight: 700 }}>{r.value}</span>
        </div>
      ))}

      {extra}

      <div style={{ width: '100%', height: 1, background: divider, margin: '8px 0 7px' }} />
      <div style={{ fontSize: 8, color: labelColor, letterSpacing: 1 }}>
        ● {night ? 'LIVE SENSOR DATA' : 'CITY INTELLIGENCE PLATFORM'}
      </div>
    </div>
  )
}
