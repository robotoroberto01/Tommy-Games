import { useEffect, useRef, useState } from 'react'
import { FACILITIES } from '../data.js'
import { fmt } from '../format.js'
import Icon from '../icons.jsx'
import {
  buyRig,
  bulkRigCost,
  capacityAfterBuy,
  resolveBuyCount,
  useGame,
} from '../store.js'

// How many bars in the little level meter, and the count that fills all of them.
const SEGMENTS = 8
const FULL_AT = 200

/**
 * How many bars to light for a given count.
 *
 * Log-scaled, not linear. Counts run from 0 to well past 100 — the price of a
 * rig grows 1.15x each time, so 100 Hand-Cranks is an ordinary mid-game number
 * while 200 is near the end of what anyone reaches. On a linear scale your
 * first ten purchases wouldn't move the meter at all, which is exactly when
 * seeing it move matters most.
 */
function litSegments(owned) {
  if (owned <= 0) return 0
  const fraction = Math.log10(owned + 1) / Math.log10(FULL_AT + 1)
  return Math.min(SEGMENTS, Math.max(1, Math.round(fraction * SEGMENTS)))
}

/** The count, big, with a level meter under it. */
function OwnedMeter({ owned, afford }) {
  const lit = litSegments(owned)

  return (
    <span className="owned">
      <span className={`owned-count num${owned > 0 ? '' : ' none'}`}>{owned}</span>
      <span className="owned-meter" aria-hidden="true">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span
            key={i}
            className={`owned-seg${i < lit ? ' lit' : ''}${afford ? ' afford' : ''}`}
          />
        ))}
      </span>
    </span>
  )
}

/**
 * One rig in the list.
 *
 * Note what this subscribes to: numbers and booleans, never objects. It also
 * asks the store for the *answer* ("can I afford this?") rather than the raw
 * balance — so it re-renders when affordability flips, not on every one of the
 * five ticks a second where the balance merely went up a bit.
 */
export default function RigRow({ rig, mode }) {
  const owned = useGame((s) => s.rigsOwned[rig.id])
  const locked = useGame((s) => rig.reqLevel > s.facilityLevel)

  // With mode 'max' and nothing affordable this is 0, but we still want to show
  // a price, so the displayed figure is always for at least one.
  const count = useGame((s) => Math.max(1, resolveBuyCount(rig, mode, s)))
  const cost = useGame((s) =>
    bulkRigCost(rig, Math.max(1, resolveBuyCount(rig, mode, s)), s),
  )
  const afford = useGame(
    (s) =>
      rig.reqLevel <= s.facilityLevel &&
      s.balance >= bulkRigCost(rig, Math.max(1, resolveBuyCount(rig, mode, s)), s),
  )

  // How far over the ceilings this purchase would put you. Showing it here is
  // the point: you find out before you buy, not from a warning afterwards.
  const powerShort = useGame(
    (s) => capacityAfterBuy(rig, Math.max(1, resolveBuyCount(rig, mode, s)), s).powerShort,
  )
  const heatShort = useGame(
    (s) => capacityAfterBuy(rig, Math.max(1, resolveBuyCount(rig, mode, s)), s).heatShort,
  )

  const [pulsing, setPulsing] = useState(false)
  const pulseTimer = useRef(null)

  // ---------------------------------------------------------------------------
  // The price climbing after a purchase.
  //
  // Every rig costs 15% more than the last, and that compounding IS the game —
  // but the number just snapping to a new value doesn't read as "that got more
  // expensive". So the figure rolls up to its new value over a few hundred
  // milliseconds and flashes while it does.
  //
  // The target is read from a ref rather than captured, so buying repeatedly
  // retargets a running animation instead of fighting it.
  // ---------------------------------------------------------------------------
  const [risingCost, setRisingCost] = useState(null)
  const [rising, setRising] = useState(false)
  const frame = useRef(null)

  // Kept in an effect rather than assigned during render — writing a ref while
  // rendering isn't safe under concurrent React. The effect runs before the
  // next animation frame, so the target is always current by the time it's read.
  const costRef = useRef(cost)
  useEffect(() => {
    costRef.current = cost
  }, [cost])

  useEffect(
    () => () => {
      clearTimeout(pulseTimer.current)
      cancelAnimationFrame(frame.current)
    },
    [],
  )

  function handleBuy() {
    if (!afford) return

    // Where the number is right now — mid-animation if you're buying fast.
    const from = risingCost ?? cost
    buyRig(rig, count)

    setPulsing(true)
    clearTimeout(pulseTimer.current)
    pulseTimer.current = setTimeout(() => setPulsing(false), 400)

    setRising(true)
    cancelAnimationFrame(frame.current)
    const startedAt = performance.now()
    const DURATION = 420

    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / DURATION)
      const eased = 1 - Math.pow(1 - progress, 3)
      setRisingCost(from + (costRef.current - from) * eased)
      if (progress < 1) {
        frame.current = requestAnimationFrame(step)
      } else {
        setRisingCost(null)
        setRising(false)
      }
    }
    frame.current = requestAnimationFrame(step)
  }

  const classes = [
    'row',
    locked ? 'locked' : '',
    afford ? 'afford' : '',
    pulsing ? 'pulse' : '',
  ]
    .filter(Boolean)
    .join(' ')

  // What the second line says, most useful thing first.
  let meta = `+${fmt(rig.baseYield)}/s each`
  let metaWarn = false
  if (locked) {
    meta = `Unlocks at ${FACILITIES[rig.reqLevel].name}`
  } else if (heatShort > 0) {
    // Whole units — capacityAfterBuy already rounded these, and "+3.00 cooling"
    // reads like a precision the number doesn't have.
    meta = `Needs +${heatShort.toLocaleString()} cooling — would throttle`
    metaWarn = true
  } else if (powerShort > 0) {
    meta = `Needs +${powerShort.toLocaleString()} power — would throttle`
    metaWarn = true
  }

  return (
    <button type="button" className={classes} onClick={handleBuy} disabled={locked}>
      <OwnedMeter owned={owned} afford={afford} />
      <Icon name={rig.icon} className="row-icon" />
      <span className="row-body">
        <span className="row-name" style={{ display: 'block' }}>
          {rig.name}
          {count > 1 && !locked ? ` ×${count}` : ''}
        </span>
        <span className={`row-meta${metaWarn ? ' warn' : ''}`} style={{ display: 'block' }}>
          {meta}
        </span>
      </span>
      <span className="row-right">
        <span className={`row-cost num${rising ? ' rising' : ''}`} style={{ display: 'block' }}>
          {fmt(risingCost ?? cost)}
        </span>
        <span className="row-delta num" style={{ display: 'block' }}>
          {locked ? `+${fmt(rig.baseYield)}/s` : `+${rig.power * count} pw +${rig.heat * count} cl`}
        </span>
      </span>
    </button>
  )
}
