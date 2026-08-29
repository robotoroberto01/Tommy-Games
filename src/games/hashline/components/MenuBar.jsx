import { FACILITIES, INFRA, MANAGERS, MAX_MGR_LEVEL } from '../data.js'
import {
  infraCost,
  managerCost,
  prestigeGain,
  prestigeUnlocked,
  useGame,
} from '../store.js'

// The red dot on a button means "there's something you can afford in here".
// Each one is a boolean selector, so a button only re-renders when its dot
// actually turns on or off.
const BADGES = {
  power: (s) => INFRA.some((item) => s.balance >= infraCost(item, s)),
  map: (s) =>
    s.facilityLevel < FACILITIES.length - 1 &&
    s.balance >= FACILITIES[s.facilityLevel + 1].cost,
  shop: (s) => s.now >= s.bonusAdCooldownUntil,
  prestige: (s) => prestigeUnlocked(s) && prestigeGain(s) > 0,
  managers: (s) =>
    MANAGERS.some(
      (m) =>
        s.managersLevel[m.id] < MAX_MGR_LEVEL && s.balance >= managerCost(m, s),
    ),
}

function MenuButton({ icon, label, badgeKey, onClick }) {
  const showBadge = useGame(BADGES[badgeKey])

  return (
    <button type="button" className="menubtn" onClick={onClick}>
      <span className="ic">{icon}</span>
      {label}
      {showBadge && <span className="menu-badge" />}
    </button>
  )
}

export default function MenuBar({ onOpenSheet, onOpenManagers }) {
  return (
    <div className="menubar">
      <MenuButton
        icon="🔋"
        label="Power"
        badgeKey="power"
        onClick={() => onOpenSheet('power')}
      />
      <MenuButton
        icon="🗺️"
        label="Map"
        badgeKey="map"
        onClick={() => onOpenSheet('map')}
      />
      <MenuButton
        icon="👤"
        label="Mgrs"
        badgeKey="managers"
        onClick={onOpenManagers}
      />
      <MenuButton
        icon="◆"
        label="Shop"
        badgeKey="shop"
        onClick={() => onOpenSheet('shop')}
      />
      <MenuButton
        icon="♻️"
        label="Fork"
        badgeKey="prestige"
        onClick={() => onOpenSheet('prestige')}
      />
    </div>
  )
}
