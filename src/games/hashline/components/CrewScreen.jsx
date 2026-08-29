import { useEffect, useRef, useState } from 'react'
import { MANAGERS, MAX_MGR_LEVEL } from '../data.js'
import { fmt } from '../format.js'
import Icon from '../icons.jsx'
import ScreenHeader from './ScreenHeader.jsx'
import { levelUpManager, managerCost, useGame } from '../store.js'

const RADIUS = 29
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function CrewCard({ manager }) {
  const level = useGame((s) => s.managersLevel[manager.id])
  const cost = useGame((s) => managerCost(manager, s))
  const afford = useGame(
    (s) =>
      s.managersLevel[manager.id] < MAX_MGR_LEVEL &&
      s.balance >= managerCost(manager, s),
  )
  const maxed = level >= MAX_MGR_LEVEL

  const [pulsing, setPulsing] = useState(false)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  function handleLevelUp() {
    if (!afford) return
    levelUpManager(manager)
    setPulsing(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setPulsing(false), 400)
  }

  const classes = [
    'crew-card',
    afford ? 'afford' : '',
    maxed ? 'maxed' : '',
    pulsing ? 'pulse' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <div className="crew-portrait">
        {/* The ring fills as they level up. */}
        <svg className="ring" viewBox="0 0 66 66">
          <circle cx="33" cy="33" r={RADIUS} className="ring-bg" />
          <circle
            cx="33"
            cy="33"
            r={RADIUS}
            className="ring-fill"
            style={{
              strokeDasharray: `${CIRCUMFERENCE * (level / MAX_MGR_LEVEL)} ${CIRCUMFERENCE}`,
            }}
          />
        </svg>
        <span className="crew-ico">
          <Icon name={manager.icon} size={26} />
        </span>
      </div>
      <div className="crew-name">{manager.name}</div>
      <div className="crew-desc">{manager.desc}</div>
      <div className="crew-lvl num">
        Lv {level}/{MAX_MGR_LEVEL}
      </div>
      <button
        type="button"
        className="btn-primary"
        style={{ marginTop: 8, minHeight: 34, fontSize: 11 }}
        onClick={handleLevelUp}
        disabled={!afford}
      >
        {maxed ? 'Max level' : fmt(cost)}
      </button>
    </div>
  )
}

export default function CrewScreen() {
  return (
    <>
      <ScreenHeader title="Crew" />
      <div className="screen-note">
        Each level adds a permanent +50% to that person&apos;s rigs, up to Lv 5.
        The Operations Chief is the odd one out — instead of boosting rigs, they
        tap for you.
      </div>

      <div className="screen flush">
        <div className="crew-grid">
          {MANAGERS.map((manager) => (
            <CrewCard key={manager.id} manager={manager} />
          ))}
        </div>
      </div>
    </>
  )
}
