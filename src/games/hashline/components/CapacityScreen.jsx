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
  const throttle = useGame((s) => Math.round(throttleMultiplier(s) * 100))

  return (
    <>
      <ScreenHeader title="Capacity" />
      <div className="screen-note">
        Every rig draws power and makes heat. Go over either ceiling and
        everything slows down by the same proportion — right now you&apos;re
        running at {throttle}% of full output.
      </div>

      <div className="screen flush">
        <div className="card" style={{ background: 'transparent', padding: '0 0 4px' }}>
          <span className="row-body">
            <span className="card-desc num" style={{ display: 'block', marginTop: 0 }}>
              Power {fmt(power)} / {fmt(powerCap)}
            </span>
            <span className="card-desc num" style={{ display: 'block' }}>
              Cooling {fmt(heat)} / {fmt(coolCap)}
            </span>
          </span>
        </div>

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
