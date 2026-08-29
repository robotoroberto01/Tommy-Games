import { FACILITIES } from '../../data.js'
import { coinStr } from '../../format.js'
import { upgradeFacility, useGame } from '../../store.js'

/** Where a site sits relative to where you are now. */
function statusOf(index, currentLevel) {
  if (index < currentLevel) return 'done'
  if (index === currentLevel) return 'current'
  if (index === currentLevel + 1) return 'next'
  return 'locked'
}

function MapNode({ facility, index }) {
  const currentLevel = useGame((s) => s.facilityLevel)
  const afford = useGame((s) => s.balance >= facility.cost)
  const status = statusOf(index, currentLevel)

  return (
    <div className="map-node">
      <div className={`map-badge ${status}`} style={{ '--accent-c': facility.accent }}>
        <span>{status === 'locked' ? '🔒' : facility.icon}</span>
      </div>
      <div className={`map-card ${status}`} style={{ '--accent-c': facility.accent }}>
        <div className="map-card-scene" style={{ background: facility.scene }} />
        <div className="map-card-name">{facility.name}</div>
        <div className="map-card-blurb">{facility.blurb}</div>

        {status === 'current' && <div className="map-tag current">📍 You are here</div>}
        {status === 'done' && <div className="map-tag done">✓ Reached</div>}
        {status === 'next' && (
          <button
            type="button"
            className="map-btn"
            onClick={upgradeFacility}
            disabled={!afford}
          >
            {afford
              ? `Move in — ${coinStr(facility.cost)}`
              : `Need ${coinStr(facility.cost)}`}
          </button>
        )}
        {status === 'locked' && (
          <div className="map-tag locked">
            🔒 Reach {FACILITIES[index - 1].name} first
          </div>
        )}
      </div>
    </div>
  )
}

export default function MapPanel() {
  return (
    <>
      <div className="note">
        Move in once you can afford it. Each site permanently boosts every rig&apos;s
        output.
      </div>
      <div className="map-wrap">
        <div className="map-line" />
        {FACILITIES.map((facility, index) => (
          <MapNode key={facility.name} facility={facility} index={index} />
        ))}
        <div className="map-end">— end of the known map —</div>
      </div>
    </>
  )
}
