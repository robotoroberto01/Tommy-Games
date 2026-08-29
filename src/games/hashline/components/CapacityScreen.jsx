import { INFRA } from '../data.js'
import { fmt } from '../format.js'
import Icon from '../icons.jsx'
import ScreenHeader from './ScreenHeader.jsx'
import {
  buyInfra,
  coolingCapacity,
  heatGenerated,
  infraCost,
  powerCapacity,
  powerUsed,
  throttleMultiplier,
  useGame,
} from '../store.js'

/**
 * One of the two ceilings, drawn large.
 *
 * The bar is scaled to whichever is bigger — what you're using, or what you can
 * supply — with a tick marking the ceiling itself. That way going over doesn't
 * just peg the bar at full: you can see HOW far past it you are, and therefore
 * how much you'd need to add to fix it.
 *
 * `limiting` marks the one actually holding your output back. Both can be over
 * at once, but only the worse of the two decides the throttle, and knowing
 * which is the difference between buying the right thing and the wrong one.
 */
function CeilingMeter({ label, icon, used, capacity, limiting }) {
  const over = used > capacity
  const scale = Math.max(used, capacity, 1)
  const usedPct = (used / scale) * 100
  const capPct = (capacity / scale) * 100
  const headroom = capacity - used

  return (
    <div className={`ceiling${over ? ' over' : ''}`}>
      <div className="ceiling-head">
        <span className="ceiling-label">
          <Icon name={icon} size={15} />
          {label}
        </span>
        {limiting && <span className="ceiling-flag">LIMITING</span>}
      </div>

      <div className="ceiling-figures num">
        <span className="ceiling-used">{fmt(used)}</span>
        <span className="ceiling-cap">/ {fmt(capacity)}</span>
      </div>

      <div className="ceiling-track">
        <div className="ceiling-fill" style={{ width: `${usedPct}%` }} />
        {/* Where the ceiling sits. Only worth drawing once you're past it —
            below that it's just the end of the filled section. */}
        {over && <div className="ceiling-mark" style={{ left: `${capPct}%` }} />}
      </div>

      <div className="ceiling-foot">
        {over
          ? `${fmt(Math.abs(headroom))} over — raise this to stop throttling`
          : `${fmt(headroom)} spare`}
      </div>
    </div>
  )
}

function InfraCard({ item }) {
  const owned = useGame((s) => s.infraOwned[item.id])
  const cost = useGame((s) => infraCost(item, s))
  const afford = useGame((s) => s.balance >= infraCost(item, s))

  return (
    <button
      type="button"
      className={`card${afford ? ' afford' : ''}`}
      onClick={() => buyInfra(item)}
    >
      <Icon name={item.icon} className="row-icon" />
      <span className="row-body">
        <span className="card-name" style={{ display: 'block' }}>
          {item.name}
        </span>
        <span className="card-desc" style={{ display: 'block' }}>
          {item.desc}
        </span>
        <span className="card-sub num" style={{ display: 'block' }}>
          {owned} owned · +{owned * item.capPerUnit} capacity
        </span>
      </span>
      <span className={`pill${afford ? ' on' : ''} num`}>{fmt(cost)}</span>
    </button>
  )
}

export default function CapacityScreen() {
  const power = useGame(powerUsed)
  const powerCap = useGame(powerCapacity)
  const heat = useGame(heatGenerated)
  const coolCap = useGame(coolingCapacity)
  const output = useGame((s) => Math.round(throttleMultiplier(s) * 100))

  // Which ceiling is actually costing you output. The throttle is the worse of
  // the two ratios, so only one of them is ever the binding constraint.
  const powerRatio = power <= 0 ? 1 : Math.min(1, powerCap / power)
  const coolRatio = heat <= 0 ? 1 : Math.min(1, coolCap / heat)
  const throttled = output < 100

  return (
    <>
      <ScreenHeader title="Capacity" />

      <div className="screen flush">
        {/* This screen exists to answer one question — am I throttled, and by
            what — so the answer gets to be the biggest thing on it rather than
            a sentence above the shop. */}
        <div className={`output${throttled ? ' throttled' : ''}`}>
          <div className="output-figure num">{output}%</div>
          <div className="output-label">
            {throttled ? 'of full output — something is holding you back' : 'of full output'}
          </div>
        </div>

        <CeilingMeter
          label="POWER"
          icon="bolt"
          used={power}
          capacity={powerCap}
          limiting={throttled && powerRatio <= coolRatio}
        />
        <CeilingMeter
          label="COOLING"
          icon="coolingUnit"
          used={heat}
          capacity={coolCap}
          limiting={throttled && coolRatio < powerRatio}
        />

        <div className="group-head">RAISE A CEILING</div>

        {INFRA.map((item) => (
          <InfraCard key={item.id} item={item} />
        ))}

        <div className="note">
          Two rigs raise a ceiling instead of eating into one: a Solar Array adds
          power, a Cold Room adds cooling. Both are worth buying for that alone
          when you&apos;re close to the line.
        </div>
      </div>
    </>
  )
}
