import { FACILITIES } from '../data.js'
import { fmt, formatDuration } from '../format.js'
import Icon from '../icons.jsx'
import ScreenHeader from './ScreenHeader.jsx'
import { secondsToAfford, upgradeFacility, useGame } from '../store.js'

/** Where a site sits relative to where you are now. */
function statusOf(index, currentLevel) {
  if (index < currentLevel) return 'done'
  if (index === currentLevel) return 'current'
  if (index === currentLevel + 1) return 'next'
  return 'locked'
}

function Site({ facility, index }) {
  const level = useGame((s) => s.facilityLevel)
  const afford = useGame((s) => s.balance >= facility.cost)
  const eta = useGame((s) => formatDuration(secondsToAfford(facility.cost, s)))
  const status = statusOf(index, level)

  const clickable = status === 'next' && afford

  return (
    <button
      type="button"
      className={`site ${status}`}
      onClick={clickable ? upgradeFacility : undefined}
      disabled={!clickable}
    >
      <Icon
        name={status === 'locked' ? 'lock' : facility.icon}
        size={22}
        className="site-ico"
      />
      <span className="row-body">
        <span className="site-name" style={{ display: 'block' }}>
          {facility.name}
        </span>
        <span className="site-blurb" style={{ display: 'block' }}>
          {facility.blurb}
        </span>

        {status === 'current' && <span className="site-tag current">You are here</span>}
        {status === 'done' && <span className="site-tag done">Reached</span>}
        {status === 'next' && (
          <span className="site-tag" style={{ color: afford ? '#ffd84d' : '#8b8b9c' }}>
            {afford ? `Move in — ${fmt(facility.cost)}` : `${fmt(facility.cost)} · ~${eta} away`}
          </span>
        )}
        {status === 'locked' && (
          <span className="site-tag locked">
            Reach {FACILITIES[index - 1].name} first
          </span>
        )}
      </span>
    </button>
  )
}

export default function SitesScreen({ onNavigate }) {
  return (
    <>
      <ScreenHeader title="Sites" back={() => onNavigate('rigs')} />
      <div className="screen-note">
        Each move multiplies every rig&apos;s output by 1.4× and unlocks the next
        tier of hardware. Moving also pays out gems.
      </div>

      <div className="screen flush">
        {FACILITIES.map((facility, index) => (
          <Site key={facility.name} facility={facility} index={index} />
        ))}
      </div>
    </>
  )
}
