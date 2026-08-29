import { useEffect, useRef, useState } from 'react'
import {
  AD_PLAYBACK_MS,
  GEM_PACKS,
  MARKET_ITEMS,
  MARKET_SECTIONS,
  MYSTERY_BAD_KINDS,
  MYSTERY_ITEM,
} from '../data.js'
import { pct, secondsUntil } from '../format.js'
import Icon from '../icons.jsx'
import {
  adBoostActive,
  buyMarketItem,
  buyMysteryItem,
  grantSimulatedGems,
  marketCost,
  mysteryCost,
  mysteryOdds,
  useGame,
  watchBonusAd,
} from '../store.js'

/** Runs `action` after a short fake "ad is playing" delay. */
function useFakeAd(action) {
  const [playing, setPlaying] = useState(false)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  return {
    playing,
    play() {
      if (playing) return
      setPlaying(true)
      timer.current = setTimeout(() => {
        action()
        setPlaying(false)
      }, AD_PLAYBACK_MS)
    },
  }
}

function MarketItem({ item }) {
  const level = useGame((s) => (item.oneShot ? 0 : s.marketPurchases[item.id]))
  const cost = useGame((s) => marketCost(item, s))
  const afford = useGame((s) => s.gems >= marketCost(item, s))
  const offlineHours = useGame((s) => s.maxOfflineHours)

  const extra = item.id === 'standby' ? ` · now ${offlineHours}h` : ''

  return (
    <button
      type="button"
      className={`card${afford ? ' afford' : ''}`}
      onClick={() => buyMarketItem(item)}
      disabled={!afford}
    >
      <span className="row-body">
        <span className="card-name" style={{ display: 'block' }}>
          {item.name}
          {level > 0 && <span className="num" style={{ opacity: 0.55 }}> Lv {level}</span>}
        </span>
        <span className="card-desc" style={{ display: 'block' }}>
          {item.desc}
          {extra}
        </span>
      </span>
      <span className={`pill${afford ? ' on' : ''} num`}>{cost}</span>
    </button>
  )
}

/**
 * The Mystery Crate.
 *
 * Every other item here does exactly what its description says. This one
 * doesn't tell you what you'll get — that's the point — so the card sells the
 * gamble itself and the outcome arrives as a toast.
 *
 * The odds are available but folded away. Two reasons: leaving them on the face
 * of the card spoils the surprise the item is built around, and hiding them
 * entirely isn't right either — a randomised item should always be able to tell
 * you what your chances are. Anyone who wants to know is one tap away.
 */
function MysteryCrate() {
  const cost = useGame(mysteryCost)
  const afford = useGame((s) => s.gems >= mysteryCost(s))
  const opened = useGame((s) => s.mysteryPurchases)
  const [showOdds, setShowOdds] = useState(false)

  return (
    <>
      <button
        type="button"
        className={`card${afford ? ' afford' : ''}`}
        onClick={buyMysteryItem}
        disabled={!afford}
      >
        <Icon name={MYSTERY_ITEM.icon} className="row-icon" />
        <span className="row-body">
          <span className="card-name" style={{ display: 'block' }}>
            {MYSTERY_ITEM.name}
            {opened > 0 && (
              <span className="num" style={{ opacity: 0.55 }}> · {opened} opened</span>
            )}
          </span>
          <span className="card-desc" style={{ display: 'block' }}>
            {MYSTERY_ITEM.desc}
          </span>
        </span>
        <span className={`pill${afford ? ' on' : ''} num`}>{cost}</span>
      </button>

      <button
        type="button"
        className="odds-toggle"
        onClick={() => setShowOdds((v) => !v)}
      >
        {showOdds ? 'Hide odds' : 'See odds'}
      </button>

      {showOdds && (
        <div className="odds">
          {mysteryOdds().map((outcome) => (
            <div key={outcome.id} className="odds-row">
              <span
                className={`odds-label ${
                  MYSTERY_BAD_KINDS.includes(outcome.kind) ? 'bad' : 'good'
                }`}
              >
                {outcome.label}
              </span>
              <span className="odds-chance num">{pct(outcome.chance)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function GemPack({ pack }) {
  function handleClick() {
    // This dialog is the whole point — nobody should ever be able to tap one of
    // these without being told plainly that it is not a real purchase.
    const ok = window.confirm(
      `Prototype mode — no payment method is connected and nothing will be charged.\n\n` +
        `Simulate purchasing "${pack.name}" for ${pack.gems} gems to preview how the real purchase flow would feel?`,
    )
    if (ok) grantSimulatedGems(pack)
  }

  return (
    <button type="button" className="card" onClick={handleClick}>
      <span style={{ display: 'flex', gap: 2, color: '#a78bfa', flexShrink: 0 }}>
        {Array.from({ length: pack.tier }, (_, i) => (
          <Icon key={i} name="gem" size={13} />
        ))}
      </span>
      <span className="row-body">
        <span className="card-name" style={{ display: 'block' }}>
          {pack.name}
          {pack.tag && (
            <span style={{ color: '#ffd84d', fontSize: 10, marginLeft: 6 }}>{pack.tag}</span>
          )}
        </span>
        <span className="card-desc" style={{ display: 'block' }}>
          {pack.desc}
        </span>
        <span className="card-sub num" style={{ display: 'block', color: '#a78bfa' }}>
          {pack.gems.toLocaleString()} gems
        </span>
      </span>
      <span className="pill gem">{pack.price}</span>
    </button>
  )
}

function FreeBoost() {
  const onCooldown = useGame((s) => s.now < s.bonusAdCooldownUntil)
  const secondsLeft = useGame((s) => secondsUntil(s.bonusAdCooldownUntil, s.now))
  const boosted = useGame(adBoostActive)
  const boostLeft = useGame((s) => secondsUntil(s.adBoostUntil, s.now))
  const ad = useFakeAd(watchBonusAd)

  let label = 'Watch'
  if (ad.playing) label = '···'
  else if (boosted) label = `${boostLeft}s`
  else if (onCooldown) label = `${secondsLeft}s`

  return (
    <button
      type="button"
      className={`card${!ad.playing && !onCooldown && !boosted ? ' afford' : ''}`}
      onClick={ad.play}
      disabled={ad.playing || onCooldown}
    >
      <Icon name="play" className="row-icon" />
      <span className="row-body">
        <span className="card-name" style={{ display: 'block' }}>
          Watch a short ad
        </span>
        <span className="card-desc" style={{ display: 'block' }}>
          {boosted ? '2× income and tap, running now' : '+5 gems and 2× for 3 minutes'}
        </span>
      </span>
      <span className={`pill${!onCooldown && !boosted && !ad.playing ? ' on' : ''} num`}>
        {label}
      </span>
    </button>
  )
}

export default function MarketScreen() {
  const [tab, setTab] = useState('spend')
  const gems = useGame((s) => s.gems)

  return (
    <>
      <div className="screen-head">
        <span className="screen-title">Market</span>
        <span className="gem-chip num" style={{ fontSize: 15 }}>
          <Icon name="gem" size={14} />
          {gems}
        </span>
      </div>

      {/* Spending gems and buying gems are different jobs. The old shop stacked
          them in one sheet with the thing players actually want listed third. */}
      <div className="segmented">
        <button
          type="button"
          className={tab === 'spend' ? 'on' : ''}
          onClick={() => setTab('spend')}
        >
          Upgrades
        </button>
        <button
          type="button"
          className={tab === 'buy' ? 'on' : ''}
          onClick={() => setTab('buy')}
        >
          Get gems
        </button>
      </div>

      {tab === 'spend' ? (
        <div className="screen flush">
          {MARKET_SECTIONS.map((section) => {
            const items = MARKET_ITEMS.filter((item) => item.kind === section.kind)
            if (items.length === 0) return null
            return (
              <div key={section.kind} style={{ display: 'contents' }}>
                <div className="group-head">{section.label}</div>
                {items.map((item) => (
                  <MarketItem key={item.id} item={item} />
                ))}
              </div>
            )
          })}

          {/* Last on purpose: the predictable upgrades come first, and the
              gamble is something you go looking for rather than land on. */}
          <div className="group-head">TAKE A CHANCE</div>
          <MysteryCrate />

          <div className="group-head">FREE</div>
          <FreeBoost />
        </div>
      ) : (
        <div className="screen flush">
          {GEM_PACKS.map((pack) => (
            <GemPack key={pack.id} pack={pack} />
          ))}
          <div className="note">
            <b style={{ color: '#f2f2f5' }}>Nothing here charges anyone.</b> There is
            no payment provider connected to this game — tapping a pack just
            simulates receiving gems so the flow can be looked at. Gems are also
            earned free by moving to a new site and by the ad on the Upgrades tab.
          </div>
        </div>
      )}
    </>
  )
}
