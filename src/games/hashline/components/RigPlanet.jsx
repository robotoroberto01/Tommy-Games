import { useEffect, useRef, useState } from 'react'
import { coinStr } from '../format.js'
import { buyRig, rigCost, useGame } from '../store.js'

/**
 * One rig, orbiting the hub. Tap to buy another.
 *
 * Note what this subscribes to: `owned` (a number) and `afford` (a boolean).
 * It deliberately does NOT subscribe to the balance, which changes 5 times a
 * second — so this only re-renders when it actually has something new to show,
 * such as crossing from unaffordable to affordable.
 */
export default function RigPlanet({ rig }) {
  const owned = useGame((s) => s.rigsOwned[rig.id])
  const cost = useGame((s) => rigCost(rig, s))
  const afford = useGame((s) => s.balance >= rigCost(rig, s))

  // Fly-in on first appearance: render with .enter, then drop it a frame later
  // so the CSS transition has something to animate from.
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Brief squash animation when you buy one.
  const [pulsing, setPulsing] = useState(false)
  const pulseTimer = useRef(null)
  useEffect(() => () => clearTimeout(pulseTimer.current), [])

  function handleBuy() {
    if (!afford) return
    buyRig(rig)
    setPulsing(true)
    clearTimeout(pulseTimer.current)
    pulseTimer.current = setTimeout(() => setPulsing(false), 400)
  }

  const classes = [
    'planet',
    'rig-planet',
    entered ? '' : 'enter',
    afford ? 'afford' : '',
    pulsing ? 'pulse' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type="button" className={classes} onClick={handleBuy}>
      <div className="planet-body">
        {rig.icon}
        {owned > 0 && <span className="planet-owned">{owned}</span>}
      </div>
      <div className="planet-label">{rig.name}</div>
      <div className="planet-cost">{coinStr(cost)}</div>
    </button>
  )
}
