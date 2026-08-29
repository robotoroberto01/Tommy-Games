import { Link } from 'react-router-dom'
import { FACILITIES } from '../data.js'
import { fmt, secondsUntil } from '../format.js'
import {
  coolingCapacity,
  heatGenerated,
  incomeBoostActive,
  powerCapacity,
  powerUsed,
  ratePerSec,
  tapBoostActive,
  useGame,
} from '../store.js'
import Ticker from './Ticker.jsx'

/** One of the two capacity meters (power, cooling). */
function ResourceBar({ label, icon, used, capacity, variant }) {
  const over = used > capacity
  const pct = Math.min(100, (used / Math.max(1, capacity)) * 100)

  return (
    <div className="resbox">
      <div className="resbox-head">
        <span>
          {icon} {label}
        </span>
        <b>
          {fmt(used)}/{fmt(capacity)}
        </b>
      </div>
      <div className="resbar">
        <div
          className={`resbar-fill ${variant}${over ? ' over' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/** The gold line that only appears while a Market boost is running. */
function BoostLine() {
  const income = useGame(incomeBoostActive)
  const tap = useGame(tapBoostActive)
  const incomeLeft = useGame((s) => secondsUntil(s.incomeBoostUntil, s.now))
  const tapLeft = useGame((s) => secondsUntil(s.tapBoostUntil, s.now))

  const parts = []
  if (income) parts.push(`⚡ 2x income ${incomeLeft}s`)
  if (tap) parts.push(`🔥 3x tap ${tapLeft}s`)
  if (parts.length === 0) return null

  return <div className="rate boostline">{parts.join(' · ')}</div>
}

export default function Header({ onOpenMap }) {
  const balance = useGame((s) => fmt(s.balance))
  const rate = useGame((s) => fmt(ratePerSec(s)))
  const gems = useGame((s) => s.gems)
  const facilityLevel = useGame((s) => s.facilityLevel)

  const power = useGame(powerUsed)
  const powerCap = useGame(powerCapacity)
  const heat = useGame(heatGenerated)
  const coolCap = useGame(coolingCapacity)

  const facility = FACILITIES[facilityLevel]

  return (
    <header>
      <div className="toprow">
        <div className="brand">
          <div className="dot" />
          <span>Hashline Mining Co.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/" className="back-link">
            ← Arcade
          </Link>
          <div className="gems">◆ <span>{gems}</span></div>
        </div>
      </div>

      <div className="balance">
        <span className="coinicon">🪙</span>
        <span>{balance}</span>
        <small>coins</small>
      </div>
      <div className="rate">
        Income: <b>{rate}</b> coins/sec
      </div>
      <BoostLine />

      <button
        type="button"
        className="site-chip"
        onClick={onOpenMap}
        style={{ '--accent-c': facility.accent }}
      >
        <span className="site-ico">{facility.icon}</span>
        <div className="site-txt">
          <div className="site-label">Current site</div>
          <b>{facility.name}</b>
        </div>
        <span className="site-arrow">Map →</span>
      </button>

      <div className="resrow">
        <ResourceBar
          label="Power"
          icon="⚡"
          used={power}
          capacity={powerCap}
          variant="power"
        />
        <ResourceBar
          label="Cooling"
          icon="❄️"
          used={heat}
          capacity={coolCap}
          variant="cooling"
        />
      </div>

      <Ticker />
    </header>
  )
}
