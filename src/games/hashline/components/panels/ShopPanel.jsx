import { useEffect, useRef, useState } from 'react'
import { AD_PLAYBACK_MS, GEM_PACKS, MARKET_ITEMS, MARKET_SECTIONS } from '../../data.js'
import { secondsUntil } from '../../format.js'
import {
  adBoostActive,
  buyMarketItem,
  grantSimulatedGems,
  marketCost,
  useGame,
  watchBonusAd,
  watchRewardAd,
} from '../../store.js'

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

function BonusAd() {
  const onCooldown = useGame((s) => s.now < s.bonusAdCooldownUntil)
  const secondsLeft = useGame((s) => secondsUntil(s.bonusAdCooldownUntil, s.now))
  const ad = useFakeAd(watchBonusAd)

  let label = 'Watch'
  if (ad.playing) label = 'Playing…'
  else if (onCooldown) label = `${secondsLeft}s`

  return (
    <div className="pack bonus-ad">
      <div className="pack-icon">🎬</div>
      <div className="pack-info">
        <div className="name">Watch a Bonus Ad</div>
        <div className="desc">
          Optional — +5 gems and a 3-min 2x income &amp; tap boost. Never plays
          without you tapping it.
        </div>
      </div>
      <button
        type="button"
        className="pack-buy"
        onClick={ad.play}
        disabled={ad.playing || onCooldown}
      >
        {label}
      </button>
    </div>
  )
}

function RewardAd() {
  const boosted = useGame(adBoostActive)
  const boostLeft = useGame((s) => secondsUntil(s.adBoostUntil, s.now))
  const onCooldown = useGame((s) => s.now < s.rewardAdCooldownUntil)
  const cooldownLeft = useGame((s) => secondsUntil(s.rewardAdCooldownUntil, s.now))
  const ad = useFakeAd(watchRewardAd)

  let label = '▶ Watch ad for 2x, 3 min'
  if (ad.playing) label = '▶ playing ad...'
  else if (boosted) label = `2x active — ${boostLeft}s`
  else if (onCooldown) label = `▶ next ad in ${cooldownLeft}s`

  return (
    <div style={{ marginTop: 8 }}>
      <button
        type="button"
        className={`btn-ghost${boosted ? ' boosted' : ''}`}
        onClick={ad.play}
        disabled={ad.playing || boosted || onCooldown}
      >
        {label}
      </button>
    </div>
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
    <div className="pack">
      {pack.tag && <div className="pack-tag">{pack.tag}</div>}
      <div className="pack-icon">{pack.icon}</div>
      <div className="pack-info">
        <div className="name">{pack.name}</div>
        <div className="desc">{pack.desc}</div>
        <div className="gemline">◆ {pack.gems.toLocaleString()} gems</div>
      </div>
      <button type="button" className="pack-buy" onClick={handleClick}>
        {pack.price}
      </button>
    </div>
  )
}

function MarketItem({ item }) {
  const level = useGame((s) => (item.oneShot ? 0 : s.marketPurchases[item.id]))
  const cost = useGame((s) => marketCost(item, s))
  const afford = useGame((s) => s.gems >= marketCost(item, s))
  const offlineHours = useGame((s) => s.maxOfflineHours)

  const levelTag = !item.oneShot && level > 0 ? ` · Lv ${level}` : ''
  const extraNote =
    item.id === 'standby' ? ` (currently ${offlineHours}h window)` : ''

  return (
    <div className="market-item">
      <div className="row1">
        <div>
          <div className="name">
            {item.name}
            {levelTag}
          </div>
          <div className="desc">
            {item.desc}
            {extraNote}
          </div>
        </div>
        <div className="gemcost">◆ {cost}</div>
      </div>
      <button
        type="button"
        className="buy-mini"
        onClick={() => buyMarketItem(item)}
        disabled={!afford}
      >
        {afford ? 'Purchase' : 'Not enough gems'}
      </button>
    </div>
  )
}

export default function ShopPanel() {
  return (
    <>
      <h2 className="sec" style={{ marginTop: 0 }}>
        Bonus Ad
      </h2>
      <BonusAd />

      <div className="note">
        Passive income accrues automatically. Coins here are just for fun — nothing
        is ever real money.
        <RewardAd />
      </div>

      <h2 className="sec">Buy Gems</h2>
      {GEM_PACKS.map((pack) => (
        <GemPack key={pack.id} pack={pack} />
      ))}
      <div className="note">
        <b>Prototype note:</b> no payment is processed here — tapping a pack just
        simulates receiving gems so you can preview the flow. A shipped app would
        trigger Apple&apos;s StoreKit purchase sheet instead.
      </div>

      <h2 className="sec">Spend Gems</h2>
      {MARKET_SECTIONS.map((section) => {
        const items = MARKET_ITEMS.filter((item) => item.kind === section.kind)
        if (items.length === 0) return null
        return (
          <div key={section.kind}>
            <div className="market-head">{section.label}</div>
            {items.map((item) => (
              <MarketItem key={item.id} item={item} />
            ))}
          </div>
        )
      })}
    </>
  )
}
