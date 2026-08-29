import { useEffect, useRef, useState } from 'react'
import { MANAGERS, MAX_MGR_LEVEL } from '../data.js'
import { coinStr } from '../format.js'
import { levelUpManager, managerCost, useGame } from '../store.js'

const RADIUS = 30
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function ManagerCard({ manager }) {
  const level = useGame((s) => s.managersLevel[manager.id])
  const cost = useGame((s) => managerCost(manager, s))
  const maxed = level >= MAX_MGR_LEVEL
  const afford = useGame(
    (s) => s.managersLevel[manager.id] < MAX_MGR_LEVEL && s.balance >= managerCost(manager, s),
  )

  const [pulsing, setPulsing] = useState(false)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  function handleLevelUp() {
    if (!afford) return
    levelUpManager(manager)
    setPulsing(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setPulsing(false), 500)
  }

  const classes = [
    'mgr-card',
    afford ? 'afford' : '',
    maxed ? 'maxed' : '',
    pulsing ? 'pulse' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <div className="mgr-portrait">
        {/* The ring fills up as the manager levels. */}
        <svg viewBox="0 0 70 70">
          <circle cx="35" cy="35" r={RADIUS} className="ring-bg" />
          <circle
            cx="35"
            cy="35"
            r={RADIUS}
            className="ring-fill"
            style={{
              strokeDasharray: `${CIRCUMFERENCE * (level / MAX_MGR_LEVEL)} ${CIRCUMFERENCE}`,
            }}
          />
        </svg>
        <span className="mgr-ico">{manager.icon}</span>
      </div>
      <div className="mgr-name">{manager.name}</div>
      <div className="mgr-desc">{manager.desc}</div>
      <div className="mgr-lvl">
        Lv {level}/{MAX_MGR_LEVEL}
      </div>
      <button
        type="button"
        className="mgr-btn"
        onClick={handleLevelUp}
        disabled={!afford}
      >
        {maxed ? 'Max level' : `Level up — ${coinStr(cost)}`}
      </button>
    </div>
  )
}

/** Full-screen overlay listing the four managers. */
export default function ManagersPage({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div className={`mgr-overlay${open ? ' show' : ''}`}>
      <div className="mgr-overlay-bg" />
      <div className="mgr-head">
        <button type="button" className="mgr-back" onClick={onClose}>
          ← Back
        </button>
        <div className="mgr-title">Manager&apos;s Office</div>
      </div>
      <div className="mgr-sub">
        Level up your managers — each level adds a permanent boost, capped at Lv 5.
      </div>
      <div className="mgr-grid">
        {open &&
          MANAGERS.map((manager) => (
            <ManagerCard key={manager.id} manager={manager} />
          ))}
      </div>
    </div>
  )
}
