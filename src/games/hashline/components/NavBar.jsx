import { INFRA, MANAGERS, MARKET_ITEMS, MAX_MGR_LEVEL } from '../data.js'
import Icon from '../icons.jsx'
import {
  infraCost,
  managerCost,
  marketCost,
  mysteryCost,
  prestigeGain,
  prestigeUnlocked,
  useGame,
} from '../store.js'

// A dot means "there's something in here you can afford right now". Each one is
// a boolean selector, so a tab only re-renders when its dot turns on or off —
// not on every tick.
const HAS_SOMETHING = {
  capacity: (s) => INFRA.some((item) => s.balance >= infraCost(item, s)),
  crew: (s) =>
    MANAGERS.some(
      (m) => s.managersLevel[m.id] < MAX_MGR_LEVEL && s.balance >= managerCost(m, s),
    ),
  market: (s) =>
    s.now >= s.bonusAdCooldownUntil ||
    s.gems >= mysteryCost(s) ||
    MARKET_ITEMS.some((item) => s.gems >= marketCost(item, s)),
  rebuild: (s) => prestigeUnlocked(s) && prestigeGain(s) > 0,
  rigs: () => false,
}

const TABS = [
  { id: 'rigs', label: 'Rigs', icon: 'miniRack' },
  { id: 'capacity', label: 'Capacity', icon: 'bolt' },
  { id: 'crew', label: 'Crew', icon: 'person' },
  { id: 'market', label: 'Market', icon: 'gem' },
  { id: 'rebuild', label: 'Rebuild', icon: 'rebuild' },
]

function NavButton({ tab, active, onChange }) {
  const dot = useGame(HAS_SOMETHING[tab.id])

  return (
    <button
      type="button"
      className={`navbtn${active ? ' on' : ''}`}
      onClick={() => onChange(tab.id)}
    >
      <Icon name={tab.icon} size={21} />
      <span className="navbtn-label">{tab.label}</span>
      {dot && !active && <span className="nav-dot" />}
    </button>
  )
}

export default function NavBar({ tab, onChange }) {
  return (
    <nav className="navbar">
      {TABS.map((t) => (
        <NavButton
          key={t.id}
          tab={t}
          // Sites isn't a tab of its own — it belongs to Rigs, which is where
          // you get to it from.
          active={tab === t.id || (t.id === 'rigs' && tab === 'sites')}
          onChange={onChange}
        />
      ))}
    </nav>
  )
}
