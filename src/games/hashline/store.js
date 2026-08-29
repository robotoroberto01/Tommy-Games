// The game's brain: all state, all rules, and the tick loop.
//
// ---------------------------------------------------------------------------
// WHY THE STATE LIVES OUTSIDE REACT — read this before changing anything here
// ---------------------------------------------------------------------------
// This is an idle game. The loop runs 5 times a second, forever. If we kept the
// game state in useState, React would re-render the entire component tree 5
// times a second and the game would get slow and janky as it grows.
//
// So instead:
//   * `state` below is a plain mutable object. It is the single source of truth.
//   * The loop mutates it directly and calls emit() when something changed.
//   * Components subscribe with useGame(selector) and re-render ONLY when the
//     specific value they asked for actually changes.
//
// That last part is the whole trick. A card that asks for
// `s => s.balance >= cost` re-renders when it flips from unaffordable to
// affordable — not on every one of the 5 ticks per second where the balance
// merely went up a bit.
//
// !!! THE ONE RULE !!!
// A selector passed to useGame MUST return a primitive — a number, string, or
// boolean. Never an object or array. React compares the old and new values with
// Object.is, and a fresh object is never equal to the last one, so returning
// `{a, b}` or `[...]` causes an infinite render loop. If you need several
// values, call useGame several times.

import { useSyncExternalStore } from 'react'
import {
  BASE_COOLING,
  BASE_POWER,
  BONUS_AD_COOLDOWN_MS,
  FACILITIES,
  INFRA,
  MANAGERS,
  MARKET_ITEMS,
  MAX_MGR_LEVEL,
  OFFLINE_EARN_RATE,
  PASSIVE_AD_INTERVAL_MS,
  REWARD_AD_COOLDOWN_MS,
  REWARD_AD_DURATION_MS,
  RIGS,
  TICK_MS,
} from './data.js'
import { coinStr } from './format.js'

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

function freshState() {
  return {
    balance: 5,
    lifetimeEarned: 0,
    gems: 10,
    clickBase: 0.1,
    clickLevel: 0,
    facilityLevel: 0,
    rigsOwned: Object.fromEntries(RIGS.map((r) => [r.id, 0])),
    infraOwned: Object.fromEntries(INFRA.map((i) => [i.id, 0])),
    managersLevel: Object.fromEntries(MANAGERS.map((m) => [m.id, 0])),
    marketOverclock: 0,
    marketEfficiency: 0,
    marketMasterLicense: 0,
    marketDiamondDrill: 0,
    maxOfflineHours: 0,
    marketPurchases: Object.fromEntries(
      MARKET_ITEMS.filter((i) => !i.oneShot).map((i) => [i.id, 0]),
    ),
    shards: 0,
    // The current time, refreshed by the loop.
    //
    // Countdowns (ad cooldowns, boost timers) read this instead of calling
    // Date.now() themselves. That matters: a selector must be a pure function
    // of state, and one that calls Date.now() can return a different value
    // every time React asks for it, which makes React re-render in a loop
    // trying to settle on an answer.
    now: Date.now(),
    // Timestamps. `0` means "never" / "not active".
    hiddenAt: 0,
    adBoostUntil: 0,
    incomeBoostUntil: 0,
    tapBoostUntil: 0,
    nextPassiveAdAt: Date.now() + PASSIVE_AD_INTERVAL_MS,
    rewardAdCooldownUntil: 0,
    bonusAdCooldownUntil: 0,
    nextAutoTapAt: 0,
  }
}

// ---------------------------------------------------------------------------
// Saving and loading
//
// Progress is written to localStorage every 10 seconds, and immediately when
// you hide or close the tab. It's read back once when the game first loads.
//
// Two things here are deliberate and worth not "simplifying" away:
//
// 1. Loading MERGES over the defaults rather than replacing them. It walks the
//    keys freshState() defines and only takes a saved value when one exists and
//    looks sane. So if a new rig is added to data.js tomorrow, an old save
//    still loads — the new rig just starts at 0 instead of coming back
//    `undefined` and breaking every calculation that touches it.
//
// 2. Every localStorage call is wrapped in try/catch. It throws outright in
//    some browsers (private windows, blocked site data), and an exception here
//    would stop the whole game from starting. If storage isn't available the
//    game still runs perfectly — it just won't remember anything.
//
// Known limitation: the save is per-browser, and two tabs playing at once share
// it, so whichever saves last wins. Fine for one person on one device, which is
// what this is. Progress does not follow you to another browser or phone —
// that would need accounts and a server, which is a much bigger project.
// ---------------------------------------------------------------------------

const SAVE_KEY = 'hashline.save.v1'
const SAVE_VERSION = 1
const SAVE_INTERVAL_MS = 10_000

// Plain numbers that get saved as-is.
const SAVED_NUMBERS = [
  'balance',
  'lifetimeEarned',
  'gems',
  'clickLevel',
  'facilityLevel',
  'marketOverclock',
  'marketEfficiency',
  'marketMasterLicense',
  'marketDiamondDrill',
  'maxOfflineHours',
  'shards',
  'adBoostUntil',
  'incomeBoostUntil',
  'tapBoostUntil',
  'rewardAdCooldownUntil',
  'bonusAdCooldownUntil',
]

// The "how many of each do I own" maps.
const SAVED_COUNT_MAPS = ['rigsOwned', 'infraOwned', 'managersLevel', 'marketPurchases']

function readStorage() {
  try {
    return window.localStorage.getItem(SAVE_KEY)
  } catch {
    return null
  }
}

function writeStorage(value) {
  try {
    window.localStorage.setItem(SAVE_KEY, value)
    return true
  } catch {
    return false
  }
}

function clearStorage() {
  try {
    window.localStorage.removeItem(SAVE_KEY)
  } catch {
    // Nothing to do — if we can't clear it, we couldn't have written it either.
  }
}

const isSaneNumber = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0

/**
 * Merge saved counts over defaults, one key at a time.
 *
 * Iterating over the DEFAULT keys (not the saved ones) is what makes old saves
 * survive changes to data.js: keys that no longer exist are dropped, and keys
 * that didn't exist when the save was written keep their default.
 */
function mergeCounts(defaults, saved, max = Infinity) {
  const out = { ...defaults }
  if (!saved || typeof saved !== 'object') return out
  for (const key of Object.keys(defaults)) {
    if (isSaneNumber(saved[key])) out[key] = Math.min(saved[key], max)
  }
  return out
}

function loadState() {
  const base = freshState()
  const raw = readStorage()
  if (!raw) return base

  let saved
  try {
    saved = JSON.parse(raw)
  } catch {
    // A corrupt save is worse than none — drop it rather than half-loading it.
    clearStorage()
    return base
  }
  if (!saved || typeof saved !== 'object') return base

  for (const field of SAVED_NUMBERS) {
    if (isSaneNumber(saved[field])) base[field] = saved[field]
  }

  base.rigsOwned = mergeCounts(base.rigsOwned, saved.rigsOwned)
  base.infraOwned = mergeCounts(base.infraOwned, saved.infraOwned)
  base.managersLevel = mergeCounts(base.managersLevel, saved.managersLevel, MAX_MGR_LEVEL)
  base.marketPurchases = mergeCounts(base.marketPurchases, saved.marketPurchases)

  // Clamp anything that indexes into a fixed list, so a bad save can't crash
  // the game by pointing at a facility that doesn't exist.
  base.facilityLevel = Math.min(Math.floor(base.facilityLevel), FACILITIES.length - 1)

  base.savedAt = isSaneNumber(saved.savedAt) ? saved.savedAt : 0
  return base
}

function snapshotForSave() {
  const out = { version: SAVE_VERSION, savedAt: Date.now() }
  for (const field of SAVED_NUMBERS) out[field] = state[field]
  for (const map of SAVED_COUNT_MAPS) out[map] = { ...state[map] }
  return out
}

/** Write progress to localStorage. Safe to call as often as you like. */
export function save() {
  const snapshot = snapshotForSave()
  if (writeStorage(JSON.stringify(snapshot))) {
    state.savedAt = snapshot.savedAt
  }
}

/**
 * Wipe the save and start completely over — shards, gems and Market purchases
 * included. This is the escape hatch, not the prestige button.
 */
export function resetProgress() {
  clearStorage()
  Object.assign(state, freshState())
  emitEvent({ type: 'toast', text: 'Progress reset — starting fresh' })
  emit()
}

let state = loadState()

// Set once the closed-tab payout has been handled, so it can't pay twice.
let offlineEarningsApplied = false

/**
 * Credit coins earned while the game was closed.
 *
 * Called from startGameLoop rather than at module load, for two reasons: the
 * multiplier helpers it needs are const arrow functions defined further down
 * this file and aren't initialised yet at load time, and nothing is listening
 * for the toast until the components have mounted.
 *
 * The rule is exactly the same one used when returning to a backgrounded tab:
 * it only pays out if Standby Protocol has been bought, at 20% of normal rate,
 * capped at the window that item grants. Before saving existed that upgrade
 * could never really pay off, because closing the tab lost everything anyway.
 */
function applyOfflineEarnings() {
  if (offlineEarningsApplied) return
  offlineEarningsApplied = true

  if (!state.savedAt || state.maxOfflineHours <= 0) return
  const elapsedMs = Date.now() - state.savedAt
  if (elapsedMs <= 0) return

  const cappedMs = Math.min(elapsedMs, state.maxOfflineHours * 3_600_000)
  const earned = ratePerSec(state) * (cappedMs / 1000) * OFFLINE_EARN_RATE
  if (earned <= 0.0001) return

  earn(earned)
  emitEvent({ type: 'toast', text: `Welcome back — offline earnings: +${coinStr(earned)}` })
}

export function getState() {
  return state
}

// ---------------------------------------------------------------------------
// Subscriptions
//
// Two separate channels:
//   listeners — "state changed, re-check your selector" (continuous values)
//   eventListeners — one-off things that happen (a tap, a toast) which are not
//     state and should not be stored as state
// ---------------------------------------------------------------------------

const listeners = new Set()
const eventListeners = new Set()

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emit() {
  for (const listener of listeners) listener()
}

export function subscribeToEvents(listener) {
  eventListeners.add(listener)
  return () => eventListeners.delete(listener)
}

function emitEvent(event) {
  for (const listener of eventListeners) listener(event)
}

/**
 * Subscribe a component to one value from the store.
 *
 *   const balance = useGame((s) => s.balance)
 *   const canAfford = useGame((s) => s.balance >= cost)
 *
 * The selector MUST return a primitive. See the note at the top of this file.
 */
export function useGame(selector) {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  )
}

// ---------------------------------------------------------------------------
// Derived values — pure functions of state, no mutation.
// These are the game's actual maths.
// ---------------------------------------------------------------------------

export const facilityMultiplier = (s = state) => Math.pow(1.4, s.facilityLevel)
export const shardMultiplier = (s = state) => 1 + s.shards * 0.02
export const efficiencyMultiplier = (s = state) =>
  1 + 0.05 * s.marketEfficiency + 0.25 * s.marketMasterLicense
export const overclockMultiplier = (s = state) =>
  1 + 0.1 * s.marketOverclock + 0.3 * s.marketDiamondDrill

export const adBoostActive = (s = state) => s.now < s.adBoostUntil
export const incomeBoostActive = (s = state) => s.now < s.incomeBoostUntil
export const tapBoostActive = (s = state) => s.now < s.tapBoostUntil

export const rigCost = (rig, s = state) =>
  rig.baseCost * Math.pow(1.15, s.rigsOwned[rig.id])
export const infraCost = (item, s = state) =>
  item.baseCost * Math.pow(item.growth, s.infraOwned[item.id])
export const clickUpgradeCost = (s = state) => 25 * Math.pow(1.65, s.clickLevel)
export const managerCost = (m, s = state) =>
  Math.ceil(m.baseCost * Math.pow(m.growth, s.managersLevel[m.id]))

export function marketCost(item, s = state) {
  const level = item.oneShot ? 0 : s.marketPurchases[item.id]
  return Math.ceil(item.baseCost * Math.pow(item.growth, level))
}

/** A manager adds +50% per level to every rig in its group. */
export function groupMultiplier(group, s = state) {
  const manager = MANAGERS.find((m) => m.group === group)
  if (!manager) return 1
  return 1 + s.managersLevel[manager.id] * 0.5
}

export function powerUsed(s = state) {
  return RIGS.reduce((total, r) => total + (r.power || 0) * s.rigsOwned[r.id], 0)
}

export function powerCapacity(s = state) {
  const generator = INFRA.find((i) => i.id === 'generator')
  let cap = BASE_POWER + s.infraOwned.generator * generator.capPerUnit
  for (const r of RIGS) {
    if (r.powerBonus) cap += r.powerBonus * s.rigsOwned[r.id]
  }
  return cap
}

export function heatGenerated(s = state) {
  return RIGS.reduce((total, r) => total + (r.heat || 0) * s.rigsOwned[r.id], 0)
}

export function coolingCapacity(s = state) {
  const coolant = INFRA.find((i) => i.id === 'coolant')
  let cap = BASE_COOLING + s.infraOwned.coolant * coolant.capPerUnit
  for (const r of RIGS) {
    if (r.coolingBonus) cap += r.coolingBonus * s.rigsOwned[r.id]
  }
  return cap
}

/**
 * If you draw more power than you can generate, or make more heat than you can
 * cool, everything slows down proportionally. Returns 1 when you're fine, and
 * drops toward 0 as you overrun.
 */
export function throttleMultiplier(s = state) {
  const used = powerUsed(s)
  const capacity = powerCapacity(s)
  const heat = heatGenerated(s)
  const cooling = coolingCapacity(s)
  const powerRatio = used <= 0 ? 1 : Math.min(1, capacity / used)
  const coolRatio = heat <= 0 ? 1 : Math.min(1, cooling / heat)
  return Math.min(powerRatio, coolRatio)
}

/** Coins per second from every rig you own, after every multiplier. */
export function ratePerSec(s = state) {
  let total = 0
  for (const r of RIGS) {
    total += r.baseYield * s.rigsOwned[r.id] * groupMultiplier(r.group, s)
  }
  total *= facilityMultiplier(s) * shardMultiplier(s) * efficiencyMultiplier(s)
  total *= throttleMultiplier(s)
  if (adBoostActive(s)) total *= 2
  if (incomeBoostActive(s)) total *= 2
  return total
}

/** Coins from a single tap of the hub. */
export function clickValue(s = state) {
  let value =
    s.clickBase *
    Math.pow(1.35, s.clickLevel) *
    overclockMultiplier(s) *
    shardMultiplier(s)
  if (adBoostActive(s)) value *= 2
  if (tapBoostActive(s)) value *= 3
  return value
}

/** How many Genesis Shards a fork would pay out right now. */
export const prestigeGain = (s = state) =>
  Math.floor(Math.sqrt(s.lifetimeEarned / 1_000_000))

export const prestigeUnlocked = (s = state) => s.facilityLevel >= 2

// ---------------------------------------------------------------------------
// Actions — the only things allowed to mutate state.
// Every one of them ends by calling emit() so subscribed components update.
// ---------------------------------------------------------------------------

function earn(amount) {
  state.balance += amount
  state.lifetimeEarned += amount
}

export function tap() {
  const value = clickValue()
  earn(value)
  emitEvent({ type: 'tap', value })
  emit()
}

export function buyClickUpgrade() {
  const cost = clickUpgradeCost()
  if (state.balance < cost) return
  state.balance -= cost
  state.clickLevel++
  emit()
}

export function buyRig(rig) {
  const cost = rigCost(rig)
  if (state.balance < cost) return
  state.balance -= cost
  state.rigsOwned[rig.id]++
  emit()
}

export function buyInfra(item) {
  const cost = infraCost(item)
  if (state.balance < cost) return
  state.balance -= cost
  state.infraOwned[item.id]++
  emit()
}

export function upgradeFacility() {
  const level = state.facilityLevel
  if (level >= FACILITIES.length - 1) return
  const next = FACILITIES[level + 1]
  if (state.balance < next.cost) return
  state.balance -= next.cost
  state.facilityLevel++
  const gemsGained = 10 * state.facilityLevel
  state.gems += gemsGained
  emitEvent({ type: 'toast', text: `Moved in: ${next.name} (+${gemsGained} gems)` })
  emit()
}

export function levelUpManager(manager) {
  if (state.managersLevel[manager.id] >= MAX_MGR_LEVEL) return
  const cost = managerCost(manager)
  if (state.balance < cost) return
  state.balance -= cost
  state.managersLevel[manager.id]++
  emitEvent({
    type: 'toast',
    text: `${manager.name} leveled up — now Lv ${state.managersLevel[manager.id]}`,
  })
  emit()
}

// What each market item actually does. Keyed by the ids in data.js.
const MARKET_EFFECTS = {
  turbo: () => {
    state.incomeBoostUntil = Math.max(Date.now(), state.incomeBoostUntil) + 15 * 60_000
  },
  frenzy: () => {
    state.tapBoostUntil = Math.max(Date.now(), state.tapBoostUntil) + 5 * 60_000
  },
  jumpstart: () => {
    earn(ratePerSec() * 600)
  },
  standby: () => {
    state.maxOfflineHours += 2
  },
  overclock: () => {
    state.marketOverclock++
  },
  license: () => {
    state.marketEfficiency++
  },
  master: () => {
    state.marketMasterLicense++
  },
  diamond: () => {
    state.marketDiamondDrill++
  },
}

export function buyMarketItem(item) {
  const cost = marketCost(item)
  if (state.gems < cost) return
  state.gems -= cost
  MARKET_EFFECTS[item.id]()
  if (!item.oneShot) state.marketPurchases[item.id]++
  emitEvent({ type: 'toast', text: `${item.name} applied` })
  emit()
}

/**
 * PROTOTYPE ONLY — grants gems without charging anything. There is no payment
 * provider connected to this project. The confirm dialog in ShopPanel.jsx says
 * so explicitly before this ever runs.
 */
export function grantSimulatedGems(pack) {
  state.gems += pack.gems
  emitEvent({ type: 'toast', text: `Simulated purchase: +${pack.gems} gems` })
  emit()
}

/**
 * Retire this run for Genesis Shards, which permanently boost the next one.
 *
 * KEPT: shards, gems, everything bought in the Market, and any boost that is
 * still ticking. RESET: balance, lifetime, tap level, rigs, infrastructure,
 * managers, and your facility tier.
 */
export function prestige() {
  const gain = prestigeGain()
  if (gain <= 0) return

  state.shards += gain
  state.balance = 5
  state.lifetimeEarned = 0
  state.clickLevel = 0
  state.facilityLevel = 0
  for (const r of RIGS) state.rigsOwned[r.id] = 0
  for (const i of INFRA) state.infraOwned[i.id] = 0
  for (const m of MANAGERS) state.managersLevel[m.id] = 0

  emitEvent({ type: 'toast', text: `Forked — +${gain} Genesis Shards` })
  emit()
}

export function watchBonusAd() {
  if (Date.now() < state.bonusAdCooldownUntil) return
  state.gems += 5
  state.adBoostUntil = Date.now() + REWARD_AD_DURATION_MS
  state.bonusAdCooldownUntil = Date.now() + BONUS_AD_COOLDOWN_MS
  emitEvent({ type: 'toast', text: '+5 gems · 2x boost for 3 min' })
  emit()
}

export function watchRewardAd() {
  if (Date.now() < state.rewardAdCooldownUntil) return
  state.adBoostUntil = Date.now() + REWARD_AD_DURATION_MS
  state.rewardAdCooldownUntil = Date.now() + REWARD_AD_COOLDOWN_MS
  emit()
}

// ---------------------------------------------------------------------------
// The game loop
//
// Refcounted so React 19's StrictMode (which mounts effects twice in dev)
// doesn't end up running two loops and doubling your income.
// ---------------------------------------------------------------------------

let timer = null
let lastTick = Date.now()
let lastSaveAt = Date.now()
let runners = 0

function tick() {
  const now = Date.now()
  state.now = now

  // Don't accrue income for time the tab spent in the background. Offline
  // earnings are handled separately, and only if you own Standby Protocol.
  if (document.hidden) {
    lastTick = now
    return
  }

  const dt = (now - lastTick) / 1000
  lastTick = now

  earn(ratePerSec() * dt)

  // A free payout every 90s, no interaction needed.
  if (now >= state.nextPassiveAdAt) {
    const payout = Math.max(0.05, ratePerSec() * 20)
    earn(payout)
    state.nextPassiveAdAt = now + PASSIVE_AD_INTERVAL_MS
    emitEvent({ type: 'ticker', payout })
  }

  // The Operations Chief taps for you, faster at higher levels.
  if (state.managersLevel.ops > 0 && now >= state.nextAutoTapAt) {
    tap()
    state.nextAutoTapAt = now + Math.max(1500, 4000 - state.managersLevel.ops * 450)
  }

  // Write progress periodically. Hiding or closing the tab saves immediately
  // too, so this is really just insurance against a crash or a lost tab.
  if (now - lastSaveAt >= SAVE_INTERVAL_MS) {
    save()
    lastSaveAt = now
  }

  emit()
}

function handleVisibilityChange() {
  if (document.hidden) {
    state.hiddenAt = Date.now()
    // Save the moment the tab goes away. On mobile especially, this is often
    // the last code that runs before the browser discards the page.
    save()
    lastSaveAt = Date.now()
    return
  }

  if (state.hiddenAt) {
    const elapsedMs = Date.now() - state.hiddenAt
    if (state.maxOfflineHours > 0) {
      const cappedMs = Math.min(elapsedMs, state.maxOfflineHours * 3_600_000)
      const earned = ratePerSec() * (cappedMs / 1000) * OFFLINE_EARN_RATE
      if (earned > 0.0001) {
        earn(earned)
        emitEvent({
          type: 'toast',
          text: `Welcome back — offline earnings: +${coinStr(earned)}`,
        })
      }
    }
    state.hiddenAt = 0
  }

  lastTick = Date.now()
  state.now = lastTick
  emit()
}

function handlePageHide() {
  save()
}

/** Start the loop. Returns a stop function. Safe to call more than once. */
export function startGameLoop() {
  runners++
  if (runners === 1) {
    lastTick = Date.now()
    lastSaveAt = Date.now()
    timer = setInterval(tick, TICK_MS)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    // 'pagehide' is the reliable one for closing a tab. 'beforeunload' is not
    // fired at all in some mobile browsers, which is exactly the case that
    // matters most here.
    window.addEventListener('pagehide', handlePageHide)
  }

  // Runs once per page load, after the components are mounted and listening.
  applyOfflineEarnings()
  emit()

  return () => {
    runners--
    if (runners === 0) {
      clearInterval(timer)
      timer = null
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
      // Leaving the game is itself a good moment to persist.
      save()
    }
  }
}

// ---------------------------------------------------------------------------
// IF YOU CHANGE WHAT GETS SAVED
//
// Adding a new number to the game? If it should survive a reload, add its name
// to SAVED_NUMBERS near the top. If it's a "how many do you own" map, add it to
// SAVED_COUNT_MAPS. Anything not in those lists resets on every load, which is
// the right answer for temporary things.
//
// You do NOT need to bump SAVE_VERSION to add a field — loading merges over the
// defaults, so old saves pick up the new field's default automatically. Only
// bump it (and the 'hashline.save.v1' key with it) if you change the *meaning*
// of an existing field in a way that would make old saves wrong. Bumping the
// key wipes everyone's progress, so it's a last resort.
//
// Deliberately NOT saved:
//   nextPassiveAdAt  — restored fresh, otherwise closing and reopening the tab
//                      would trigger the free payout instantly, over and over
//   now, hiddenAt,
//   nextAutoTapAt    — purely moment-to-moment bookkeeping
// ---------------------------------------------------------------------------
