import { fmt } from '../format.js'
import Icon from '../icons.jsx'
import { useGame } from '../store.js'

/**
 * The header every screen except Rigs uses.
 *
 * It always carries both balances, because both are always relevant — you want
 * to know whether you can afford a rig while you're reading the Market, and how
 * many gems you have while you're anywhere else.
 *
 * Coins are shortened here (3.56K) rather than shown in full. Full precision
 * only earns its space on the Rigs screen, where you're tapping and need to see
 * each tap land. Everywhere else you just need a sense of what you've got.
 */
export default function ScreenHeader({ title, back }) {
  const coins = useGame((s) => fmt(s.balance))
  const gems = useGame((s) => s.gems)

  return (
    <div className="screen-head">
      {back && (
        <button type="button" className="back-chip" onClick={back}>
          <Icon name="chevronLeft" size={12} />
          Back
        </button>
      )}
      <span className="screen-title">{title}</span>
      <span className="head-money">
        <span className="coin-chip num">{coins}</span>
        <span className="gem-chip num">
          <Icon name="gem" size={12} />
          {gems}
        </span>
      </span>
    </div>
  )
}
