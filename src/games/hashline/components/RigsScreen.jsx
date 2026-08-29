import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BUY_MODES, FACILITIES, RIGS } from '../data.js'
import { fmt, fmtBalance, formatDuration, secondsUntil } from '../format.js'
import Icon from '../icons.jsx'
import RigRow from './RigRow.jsx'
import {
  buyClickUpgrade,
  clickUpgradeCost,
  clickValue,
  coolingCapacity,
  heatGenerated,
  incomeBoostActive,
  powerCapacity,
  powerUsed,
  ratePerSec,
  secondsToAfford,
  subscribeToEvents,
  tap,
  tapBoostActive,
  throttleMultiplier,
  useGame,
} from '../store.js'

/** One of the two capacity meters. */
function Meter({ label, used, capacity }) {
  const over = used > capacity
  const pct = Math.min(100, (used / Math.max(1, capacity)) * 100)

  return (
    <div className="meter">
      <div className="meter-head">
        <span className="meter-label">{label}</span>
        <span className="meter-value num">
          {fmt(used)}
          <span className="meter-cap">/{fmt(capacity)}</span>
        </span>
      </div>
      <div className="meter-track">
        <div className={`meter-fill${over ? ' over' : ''}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/** The gold line that only appears while a Market boost is running. */
function BoostLine() {
  const income = useGame(incomeBoostActive)
  const tapping = useGame(tapBoostActive)
  const incomeLeft = useGame((s) => secondsUntil(s.incomeBoostUntil, s.now))
  const tapLeft = useGame((s) => secondsUntil(s.tapBoostUntil, s.now))

  const parts = []
  if (income) parts.push(`2× income ${incomeLeft}s`)
  if (tapping) parts.push(`3× tap ${tapLeft}s`)
  if (parts.length === 0) return null

  return <div className="boostline num">{parts.join(' · ')}</div>
}

/**
 * The next site, expressed as TIME rather than a percentage.
 *
 * A progress bar toward 500M when you have 84K is a sliver that never visibly
 * moves. "~2d 1h at this rate" tells you the same thing usefully, and it gets
 * shorter every time you buy a rig — which is the point.
 */
function GoalStrip({ onOpen }) {
  const level = useGame((s) => s.facilityLevel)
  const isLast = level >= FACILITIES.length - 1
  const next = isLast ? null : FACILITIES[level + 1]

  // Built as one finished phrase so the selector returns a plain string, and so
  // the zero-income case reads properly instead of "~not at this rate away".
  const eta = useGame((s) => {
    if (!next) return ''
    const seconds = secondsToAfford(next.cost, s)
    if (seconds === 0) return 'ready to move in'
    if (!Number.isFinite(seconds)) return 'buy a rig to start earning'
    return `~${formatDuration(seconds)} away`
  })

  if (!next) {
    return (
      <div className="goal">
        <Icon name="orbital" size={19} />
        <span className="goal-body">
          <span className="goal-name" style={{ display: 'block' }}>
            {FACILITIES[level].name}
          </span>
          <span className="goal-meta" style={{ display: 'block' }}>
            The last site on the map — nowhere further to move
          </span>
        </span>
      </div>
    )
  }

  return (
    <button type="button" className="goal" onClick={onOpen}>
      <Icon name={next.icon} size={19} />
      <span className="goal-body">
        <span className="goal-name" style={{ display: 'block' }}>
          {next.name}
        </span>
        <span className="goal-meta num" style={{ display: 'block' }}>
          {fmt(next.cost)} · {eta}
        </span>
      </span>
      <Icon name="chevronRight" size={16} className="goal-chevron" />
    </button>
  )
}

/** Only appears when you're actually being throttled. */
function ThrottleWarning() {
  const throttled = useGame((s) => throttleMultiplier(s) < 0.999)
  const overPower = useGame((s) => powerUsed(s) > powerCapacity(s))
  const loss = useGame((s) => Math.round((1 - throttleMultiplier(s)) * 100))

  if (!throttled) return null

  return (
    <div className="throttle">
      <Icon name="warning" size={18} />
      <span>
        Output down {loss}% —{' '}
        {overPower ? 'more power draw than you can generate' : 'more heat than you can cool'}
      </span>
    </div>
  )
}

/**
 * The coin you tap, and the numbers that float off it.
 *
 * A circle rather than a bar on purpose — it's the shape the whole
 * tap-a-thing-repeatedly genre uses, and a round target reads as something you
 * hit rather than a button you press once. It's centred and fixed, so it never
 * moves under your thumb the way the old orbiting rigs did.
 */
function TapCoin() {
  const value = useGame((s) => fmt(clickValue(s)))
  const [floats, setFloats] = useState([])
  const nextId = useRef(0)

  useEffect(
    () =>
      subscribeToEvents((event) => {
        if (event.type !== 'tap') return
        const id = nextId.current++
        const jitter = Math.random() * 44 - 22
        setFloats((current) => [...current, { id, value: event.value, jitter }])
        setTimeout(() => setFloats((c) => c.filter((f) => f.id !== id)), 900)
      }),
    [],
  )

  return (
    <div className="tap-wrap">
      {floats.map((f) => (
        <div key={f.id} className="float" style={{ marginLeft: `${f.jitter}px` }}>
          +{fmt(f.value)}
        </div>
      ))}
      <button type="button" className="tap-coin" onClick={tap} aria-label="Mine">
        <Icon name="hashCoin" size={42} />
        <span className="tap-coin-value num">+{value}</span>
      </button>
      <TapUpgrade />
    </div>
  )
}

/**
 * Makes each tap worth more — 1.35x per level.
 *
 * It sits directly under the coin because that's the thing it upgrades. Putting
 * it anywhere else means nobody finds it, which is exactly what happened when
 * the redesign first shipped without it.
 */
function TapUpgrade() {
  const level = useGame((s) => s.clickLevel)
  const cost = useGame((s) => fmt(clickUpgradeCost(s)))
  const afford = useGame((s) => s.balance >= clickUpgradeCost(s))

  return (
    <button
      type="button"
      className={`tap-upgrade${afford ? ' afford' : ''}`}
      onClick={buyClickUpgrade}
      disabled={!afford}
    >
      <Icon name="arrowUp" size={12} />
      <span>Upgrade tap</span>
      <span className="num" style={{ opacity: 0.75 }}>
        Lv {level} · {cost}
      </span>
    </button>
  )
}

export default function RigsScreen({ onNavigate }) {
  const [mode, setMode] = useState('1')

  const balance = useGame((s) => fmtBalance(s.balance))
  const rate = useGame((s) => fmt(ratePerSec(s)))
  const gems = useGame((s) => s.gems)
  const level = useGame((s) => s.facilityLevel)

  const power = useGame(powerUsed)
  const powerCap = useGame(powerCapacity)
  const heat = useGame(heatGenerated)
  const coolCap = useGame(coolingCapacity)

  const site = FACILITIES[level]

  // Everything unlocked, plus the next two — so you can see what's coming
  // without the whole 12-rig list crowding the screen from the start.
  const unlocked = RIGS.filter((rig) => rig.reqLevel <= level)
  const visibleRigs = RIGS.slice(0, unlocked.length + 2)

  return (
    <>
      <div className="topbar">
        <span className="site-chip">
          <Icon name={site.icon} size={17} />
          {site.name}
        </span>
        <span style={{ display: 'flex', gap: 6 }}>
          <Link to="/" className="back-chip">
            <Icon name="chevronLeft" size={12} />
            Arcade
          </Link>
          <span className="gem-chip num">
            <Icon name="gem" size={12} />
            {gems}
          </span>
        </span>
      </div>

      <div className="balance">
        <div className="balance-num num">{balance}</div>
        <div className="balance-sub">
          <span className="balance-label">COINS</span>
          <span className="balance-rate num">+{rate}/s</span>
        </div>
        <BoostLine />
      </div>

      <div className="meters">
        <Meter label="POWER" used={power} capacity={powerCap} />
        <Meter label="COOLING" used={heat} capacity={coolCap} />
      </div>

      <GoalStrip onOpen={() => onNavigate('sites')} />
      <ThrottleWarning />

      <div className="list-head">
        <span className="list-title">Rigs</span>
        <div className="buy-modes">
          {BUY_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`buy-mode${mode === m.id ? ' on' : ''}`}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="screen">
        {visibleRigs.map((rig) => (
          <RigRow key={rig.id} rig={rig} mode={mode} />
        ))}
      </div>

      <TapCoin />
    </>
  )
}
