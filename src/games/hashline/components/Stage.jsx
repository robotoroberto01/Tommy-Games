import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ORBIT_RINGS, RIGS } from '../data.js'
import { coinStr } from '../format.js'
import {
  buyClickUpgrade,
  clickUpgradeCost,
  clickValue,
  subscribeToEvents,
  tap,
  useGame,
} from '../store.js'
import RigPlanet from './RigPlanet.jsx'

/**
 * Work out how big each orbit ring should be for the space available.
 * Returns { A, B, C } radii in pixels.
 */
function radiiFor(width, height) {
  const base = Math.min(width || 360, height || 420) / 2
  const out = {}
  for (const [group, ring] of Object.entries(ORBIT_RINGS)) {
    out[group] = Math.min(base * ring.radiusFactor, ring.maxRadius)
  }
  return out
}

/**
 * The floating "+🪙0.10" numbers that rise off the hub when you tap.
 *
 * These are one-off visual effects, not game state, so they live here in local
 * component state rather than in the store — the store publishes a 'tap' event
 * and this listens for it.
 */
function Floats() {
  const [floats, setFloats] = useState([])
  const nextId = useRef(0)

  useEffect(
    () =>
      subscribeToEvents((event) => {
        if (event.type !== 'tap') return
        const id = nextId.current++
        const jitter = Math.random() * 30 - 15
        setFloats((current) => [...current, { id, value: event.value, jitter }])
        setTimeout(
          () => setFloats((current) => current.filter((f) => f.id !== id)),
          900,
        )
      }),
    [],
  )

  return floats.map((float) => (
    <div
      key={float.id}
      className="float"
      style={{
        left: `calc(50% - 10px + ${float.jitter}px)`,
        top: 'calc(50% - 34px)',
      }}
    >
      +{coinStr(float.value)}
    </div>
  ))
}

/**
 * The playfield: rigs orbiting a hub you tap to mine.
 *
 * The orbits are pure CSS animations. Because React keeps the same DOM nodes
 * between renders (the keys are stable), those animations keep running
 * smoothly — nothing here is torn down and rebuilt as the game ticks.
 */
export default function Stage() {
  const stageRef = useRef(null)
  const [radii, setRadii] = useState(() => radiiFor(360, 420))

  const facilityLevel = useGame((s) => s.facilityLevel)
  const tapValue = useGame((s) => coinStr(clickValue(s)))
  const clickLevel = useGame((s) => s.clickLevel)
  const upgradeCost = useGame((s) => coinStr(clickUpgradeCost(s)))
  const canUpgrade = useGame((s) => s.balance >= clickUpgradeCost(s))

  // Keep the rings sized to the stage, including when the window resizes.
  useLayoutEffect(() => {
    const element = stageRef.current
    if (!element) return
    const measure = () =>
      setRadii(radiiFor(element.clientWidth, element.clientHeight))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const visibleRigs = RIGS.filter((rig) => rig.reqLevel <= facilityLevel)

  return (
    <div className="stage" ref={stageRef}>
      {Object.entries(ORBIT_RINGS).map(([group]) => (
        <div
          key={group}
          className="orbit-guide"
          style={{ width: radii[group] * 2, height: radii[group] * 2 }}
        />
      ))}

      <div className="orbit-root">
        {Object.entries(ORBIT_RINGS).map(([group, ring]) => {
          const rigs = visibleRigs.filter((rig) => rig.group === group)
          const radius = radii[group]

          return rigs.map((rig, index) => {
            // Spread the ring's rigs evenly, then offset the whole ring a
            // little so the three rings don't all line up at the same angle.
            const angle = (360 / rigs.length) * index + radius * 0.6
            // A negative delay starts the animation part-way through, which is
            // what puts each rig at its own point on the circle.
            const delay = `${-(angle / 360) * ring.duration}s`
            const duration = `${ring.duration}s`

            return (
              <div
                key={rig.id}
                className={`orbit-arm${ring.counterClockwise ? ' ccw' : ''}`}
                style={{ animationDuration: duration, animationDelay: delay }}
              >
                <div
                  className="orbit-pos"
                  style={{ transform: `translateX(${radius}px)` }}
                >
                  {/* Spins the opposite way at the same speed, so the rig
                      stays upright instead of tumbling as it orbits. */}
                  <div
                    className="orbit-counter"
                    style={{ animationDuration: duration, animationDelay: delay }}
                  >
                    <RigPlanet rig={rig} />
                  </div>
                </div>
              </div>
            )
          })
        })}
      </div>

      <button type="button" className="hub" onClick={tap}>
        TAP TO
        <br />
        MINE
      </button>
      <div className="hub-sub">
        +<b>{tapValue}</b> / tap
      </div>
      <button
        type="button"
        className="tap-upgrade"
        onClick={buyClickUpgrade}
        disabled={!canUpgrade}
      >
        ⚡ Lv {clickLevel} — {upgradeCost}
      </button>

      <Floats />
    </div>
  )
}
