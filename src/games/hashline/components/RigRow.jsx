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
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  function handleBuy() {
    if (!afford) return
    buyRig(rig, count)
    setPulsing(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setPulsing(false), 400)
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
      <span className={`row-badge${owned > 0 ? '' : ' empty'}`}>
        {owned > 0 ? owned : '—'}
      </span>
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
        <span className="row-cost num" style={{ display: 'block' }}>
          {fmt(cost)}
        </span>
        <span className="row-delta num" style={{ display: 'block' }}>
          {locked ? `+${fmt(rig.baseYield)}/s` : `+${rig.power * count} pw +${rig.heat * count} cl`}
        </span>
      </span>
    </button>
  )
}
