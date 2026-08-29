import { FACILITIES } from '../../data.js'
import { coinStr } from '../../format.js'
import {
  prestige,
  prestigeGain,
  prestigeUnlocked,
  resetProgress,
  shardMultiplier,
  useGame,
} from '../../store.js'

export default function PrestigePanel() {
  const shards = useGame((s) => s.shards)
  const bonusPct = useGame((s) => Math.round((shardMultiplier(s) - 1) * 100))
  const lifetime = useGame((s) => coinStr(s.lifetimeEarned))
  const gain = useGame(prestigeGain)
  const unlocked = useGame(prestigeUnlocked)

  function handleFork() {
    const ok = window.confirm(
      `Fork the chain for +${gain} Genesis Shards?\n\n` +
        `This resets your balance, rigs, generators/cooling, manager levels, and facility tier. Shards and Market purchases are kept.`,
    )
    if (ok) prestige()
  }

  function handleReset() {
    const ok = window.confirm(
      'Erase your saved game and start from zero?\n\n' +
        'This wipes everything, including Genesis Shards, gems and Market purchases. It cannot be undone.',
    )
    if (ok) resetProgress()
  }

  return (
    <>
      <div className="prestige-box">
        <h3>Genesis Shards</h3>
        <p>
          Retire your current operation, keep nothing but the shards — a permanent
          income multiplier that carries into your next run.
        </p>
        <div className="big">{shards}</div>
        <div className="prestige-sub">shards owned · +{bonusPct}% income</div>
        <button
          type="button"
          className="btn-solid"
          onClick={handleFork}
          disabled={!unlocked || gain <= 0}
        >
          {unlocked
            ? `Fork now for +${gain} shards`
            : `Reach ${FACILITIES[2].name} to unlock`}
        </button>
      </div>

      <div className="shard-row">
        <span>Lifetime earned</span>
        <b>{lifetime}</b>
      </div>

      <div className="note" style={{ marginTop: 12 }}>
        Forking resets your balance, rigs, generators, cooling, manager levels, and
        facility tier back to Garage Operation. Genesis Shards and anything bought
        in the Market are kept.
      </div>

      <div className="danger-zone">
        <div className="danger-title">Start completely over</div>
        <p className="danger-text">
          Wipes your saved game — shards, gems and Market purchases included.
          This is not the same as forking, and it can&apos;t be undone.
        </p>
        <button type="button" className="danger-btn" onClick={handleReset}>
          Reset saved progress
        </button>
      </div>
    </>
  )
}
