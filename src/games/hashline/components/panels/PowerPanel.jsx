import { INFRA } from '../../data.js'
import { coinStr } from '../../format.js'
import { buyInfra, infraCost, useGame } from '../../store.js'

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
      <div className="icon c-green">{item.icon}</div>
      <div className="info">
        <div className="name">{item.name}</div>
        <div className="desc">{item.desc}</div>
        <div className="sub">
          Owned: {owned} · +{owned * item.capPerUnit} capacity so far
        </div>
      </div>
      <div className="cost">
        <div className={`price${afford ? '' : ' locked'}`}>{coinStr(cost)}</div>
        <div className="yield">+{item.capPerUnit} cap</div>
      </div>
    </button>
  )
}

export default function PowerPanel() {
  return (
    <>
      <div className="note">
        Every rig draws power and dumps heat. Keep generators and cooling ahead of
        your rig count or output gets throttled.
      </div>
      {INFRA.map((item) => (
        <InfraCard key={item.id} item={item} />
      ))}
    </>
  )
}
