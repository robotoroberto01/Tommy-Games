import { FACILITIES } from '../data.js'
import { fmt } from '../format.js'
import Icon from '../icons.jsx'
import {
  prestige,
  prestigeGain,
  prestigeUnlocked,
  resetProgress,
  shardMultiplier,
  useGame,
} from '../store.js'

export default function RebuildScreen() {
  const shards = useGame((s) => s.shards)
  const bonusPct = useGame((s) => Math.round((shardMultiplier(s) - 1) * 100))
  const lifetime = useGame((s) => fmt(s.lifetimeEarned))
  const gain = useGame(prestigeGain)
  const unlocked = useGame(prestigeUnlocked)

  function handleRebuild() {
    const ok = window.confirm(
      `Rebuild for +${gain} Genesis Shards?\n\n` +
        `This resets your balance, rigs, capacity, crew levels and site. Shards and anything bought in the Market are kept.`,
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
      <div className="screen-head">
        <span className="screen-title">Rebuild</span>
      </div>

      <div className="screen flush">
        <div className="prestige-box">
          <div className="prestige-title">Genesis Shards</div>
          <div className="prestige-copy">
            Retire this operation and keep nothing but the shards — a permanent
            income multiplier that carries into the next run.
          </div>
          <div className="prestige-big num">{shards}</div>
          <div className="prestige-sub">owned · +{bonusPct}% income</div>
          <button
            type="button"
            className="btn-primary"
            onClick={handleRebuild}
            disabled={!unlocked || gain <= 0}
          >
            {unlocked
              ? `Rebuild for +${gain} shards`
              : `Reach ${FACILITIES[2].name} to unlock`}
          </button>
        </div>

        <div className="stat-row">
          <span>Lifetime earned</span>
          <b className="num">{lifetime}</b>
        </div>

        <div className="note">
          Rebuilding resets your balance, rigs, generators, cooling, crew levels
          and site, back to the Garage. Genesis Shards and anything bought in the
          Market are kept.
        </div>

        <div className="danger">
          <div className="danger-title">
            <Icon name="warning" size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
            Start completely over
          </div>
          <p className="danger-text">
            Wipes your saved game — shards, gems and Market purchases included.
            This is not the same as rebuilding, and it can&apos;t be undone.
          </p>
          <button type="button" className="danger-btn" onClick={handleReset}>
            Reset saved progress
          </button>
        </div>
      </div>
    </>
  )
}
