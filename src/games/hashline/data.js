// All the numbers that define the game.
//
// This file is pure data — no logic, no state. If you want to rebalance the
// game (make something cheaper, add a new rig, change a name), this is almost
// always the only file you need to touch.
//
// The rules that *use* these numbers live in store.js.

export const COIN = '🪙'

// ---------------------------------------------------------------------------
// Facilities — the five sites you move through. Each one multiplies the output
// of every rig you own (see facilityMultiplier in store.js) and unlocks the
// rigs whose reqLevel matches its index.
// ---------------------------------------------------------------------------
export const FACILITIES = [
  {
    name: 'Garage Operation',
    cost: 0,
    icon: '🏚️',
    accent: '#F5A623',
    blurb: 'Where it all started — one extension cord and a dream.',
    scene: 'linear-gradient(135deg, rgba(245,166,35,.16), rgba(245,166,35,0) 65%)',
  },
  {
    name: 'Independent Mining Shop',
    cost: 2_000_000,
    icon: '🏬',
    accent: '#00D9FF',
    blurb: 'A real storefront now. The neighbors still complain about the fan noise.',
    scene: 'linear-gradient(135deg, rgba(0,217,255,.16), rgba(0,217,255,0) 65%)',
  },
  {
    name: 'Regional Data Center',
    cost: 500_000_000,
    icon: '🏢',
    accent: '#34D399',
    blurb: 'Rows of racks, badge access, and a very serious NDA.',
    scene: 'linear-gradient(135deg, rgba(52,211,153,.16), rgba(52,211,153,0) 65%)',
  },
  {
    name: 'National Grid Partner',
    cost: 250_000_000_000,
    icon: '🏭',
    accent: '#B98CFF',
    blurb: "You now have a direct line to the utility company. That's not normal.",
    scene: 'linear-gradient(135deg, rgba(185,140,255,.18), rgba(185,140,255,0) 65%)',
  },
  {
    name: 'Orbital Consortium',
    cost: 100_000_000_000_000,
    icon: '🛰️',
    accent: '#FF6B6B',
    blurb: 'Nobody fully explains this one. The view of Earth is incredible though.',
    scene: 'linear-gradient(135deg, rgba(255,107,107,.18), rgba(255,107,107,0) 65%)',
  },
]

// ---------------------------------------------------------------------------
// Rigs — the things that earn coins for you.
//
//   baseCost    price of the first one; each one you buy costs 15% more
//   baseYield   coins per second, each
//   reqLevel    facility index where this unlocks
//   group       which orbit ring it flies in, and which manager boosts it
//   power/heat  what one unit draws and dumps (see the throttle rules)
//
// powerBonus / coolingBonus are the exceptions: a Solar Array ADDS power
// capacity, a Cold Room ADDS cooling capacity.
// ---------------------------------------------------------------------------
export const RIGS = [
  { id: 'hand',    name: 'Hand-Crank',    icon: '🔧',  baseCost: 15,              baseYield: 0.1,         reqLevel: 0, group: 'A', power: 1,     heat: 1 },
  { id: 'usb',     name: 'USB Miner',     icon: '🔌',  baseCost: 90,              baseYield: 0.65,        reqLevel: 0, group: 'A', power: 2,     heat: 2 },
  { id: 'gpu',     name: 'GPU Rig',       icon: '🖥️',  baseCost: 650,             baseYield: 4.2,         reqLevel: 0, group: 'A', power: 5,     heat: 6 },
  { id: 'asic',    name: 'ASIC Box',      icon: '📦',  baseCost: 5_000,           baseYield: 28,          reqLevel: 1, group: 'A', power: 14,    heat: 18 },
  { id: 'rack',    name: 'Mini Rack',     icon: '🗄️',  baseCost: 40_000,          baseYield: 190,         reqLevel: 1, group: 'B', power: 40,    heat: 52 },
  { id: 'server',  name: 'Server Rack',   icon: '🖴',   baseCost: 320_000,         baseYield: 1_300,       reqLevel: 2, group: 'B', power: 140,   heat: 180 },
  { id: 'cold',    name: 'Cold Room',     icon: '❄️',   baseCost: 2_600_000,       baseYield: 9_000,       reqLevel: 2, group: 'B', power: 380,   heat: 120,    coolingBonus: 90 },
  { id: 'ware',    name: 'Warehouse',     icon: '🏭',  baseCost: 22_000_000,      baseYield: 65_000,      reqLevel: 3, group: 'B', power: 820,   heat: 960 },
  { id: 'solar',   name: 'Solar Array',   icon: '☀️',   baseCost: 190_000_000,     baseYield: 480_000,     reqLevel: 3, group: 'C', power: 0,     heat: 420,    powerBonus: 600 },
  { id: 'grid',    name: 'Grid Tap',      icon: '⚡',  baseCost: 1_700_000_000,   baseYield: 3_600_000,   reqLevel: 4, group: 'C', power: 5_600, heat: 4_600 },
  { id: 'orbit',   name: 'Orbital Relay', icon: '🛰️',  baseCost: 15_000_000_000,  baseYield: 28_000_000,  reqLevel: 4, group: 'C', power: 14_000, heat: 8_600 },
  { id: 'quantum', name: 'Quantum Core',  icon: '🧊',  baseCost: 140_000_000_000, baseYield: 220_000_000, reqLevel: 4, group: 'C', power: 28_000, heat: 13_500 },
]

// How each orbit ring behaves on the stage. radius is a fraction of the
// available space, capped at max so it never runs off a wide screen.
export const ORBIT_RINGS = {
  A: { radiusFactor: 0.52, maxRadius: 78,  duration: 55,  counterClockwise: false },
  B: { radiusFactor: 0.76, maxRadius: 118, duration: 80,  counterClockwise: true },
  C: { radiusFactor: 0.96, maxRadius: 155, duration: 108, counterClockwise: false },
}

// ---------------------------------------------------------------------------
// Infrastructure — raises the ceilings that rigs consume.
// ---------------------------------------------------------------------------
export const INFRA = [
  {
    id: 'generator',
    name: 'Generator',
    icon: '🔋',
    desc: 'Raises your power ceiling so more rigs can run at once.',
    baseCost: 2_200,
    growth: 1.16,
    capPerUnit: 15,
  },
  {
    id: 'coolant',
    name: 'Cooling Unit',
    icon: '🧊',
    desc: "Raises your cooling ceiling so rigs don't throttle from heat.",
    baseCost: 2_000,
    growth: 1.16,
    capPerUnit: 15,
  },
]

export const BASE_POWER = 8
export const BASE_COOLING = 8

// ---------------------------------------------------------------------------
// Managers — each level adds +50% to its group's rigs. The Operations Chief
// has no group; it auto-taps for you instead.
// ---------------------------------------------------------------------------
export const MAX_MGR_LEVEL = 5

export const MANAGERS = [
  { id: 'shift', name: 'Shift Supervisor', icon: '🧑‍🔧', group: 'A',  desc: 'Boosts Hand-Crank → ASIC Box.',      baseCost: 150_000,        growth: 2.2 },
  { id: 'fac',   name: 'Facility Manager', icon: '🧑‍💼', group: 'B',  desc: 'Boosts Mini Rack → Warehouse.',      baseCost: 300_000_000,    growth: 2.2 },
  { id: 'chief', name: 'Chief Engineer',   icon: '👩‍🔬', group: 'C',  desc: 'Boosts Solar Array → Quantum Core.', baseCost: 45_000_000_000, growth: 2.2 },
  { id: 'ops',   name: 'Operations Chief', icon: '🧑‍✈️', group: null, desc: 'Speeds up auto-tapping.',            baseCost: 6_000_000,      growth: 2.2 },
]

// ---------------------------------------------------------------------------
// Market — things you buy with gems.
//
// `kind` groups them into sections in the shop.
// `oneShot: true` means the price never escalates (you can rebuy it forever at
// the same cost). Everything else gets more expensive each time you buy it.
//
// What each one actually DOES lives in MARKET_EFFECTS in store.js.
// ---------------------------------------------------------------------------
export const MARKET_ITEMS = [
  { id: 'turbo',     name: 'Turbo Charge',            desc: '2x income for 15 minutes. Stacks with itself.',                              baseCost: 35,    growth: 1.18, kind: 'temp' },
  { id: 'frenzy',    name: 'Tap Frenzy',              desc: '3x tap value for 5 minutes. Stacks with itself.',                            baseCost: 25,    growth: 1.18, kind: 'temp' },
  { id: 'jumpstart', name: 'Cash Jumpstart',          desc: 'Instantly credits 10 minutes of your current income rate.',                  baseCost: 70,    growth: 1.4,  kind: 'util', oneShot: true },
  { id: 'standby',   name: 'Standby Protocol',        desc: "Lets the rigs keep grinding while you're gone. Grants offline earnings (20% rate) for a while after you leave. Stacks to extend the window.", baseCost: 180, growth: 1.55, kind: 'util' },
  { id: 'overclock', name: 'Golden Overclock',        desc: '+10% tap value, permanently. Stacks.',                                       baseCost: 150,   growth: 1.6,  kind: 'perm' },
  { id: 'license',   name: 'Efficiency License',      desc: '+5% income from all rigs, permanently. Stacks.',                             baseCost: 250,   growth: 1.6,  kind: 'perm' },
  { id: 'master',    name: 'Master Engineer License', desc: '+25% income from all rigs, permanently. For operators who take the smell of hot silicon personally.', baseCost: 2_200, growth: 1.9, kind: 'perm' },
  { id: 'diamond',   name: 'Diamond Drill',           desc: '+30% tap value, permanently. Overkill, in the best way.',                     baseCost: 1_800, growth: 1.9,  kind: 'perm' },
]

export const MARKET_SECTIONS = [
  { kind: 'temp', label: 'Temporary Boosts' },
  { kind: 'util', label: 'Utility' },
  { kind: 'perm', label: 'Permanent Upgrades' },
]

// ---------------------------------------------------------------------------
// Gem packs — PROTOTYPE ONLY.
//
// These do not charge anyone anything. Tapping one opens a confirm dialog that
// says so, then just adds gems. There is no payment code in this project and no
// payment provider connected. If this ever became a real app, this is where a
// StoreKit / Stripe flow would go — and that is a much bigger conversation.
// ---------------------------------------------------------------------------
export const GEM_PACKS = [
  { id: 'handful', name: 'Handful of Gems', gems: 25,  price: '$1.99',  icon: '◆',    desc: 'A rainy-day stash. Barely a jingle in your pocket.' },
  { id: 'pouch',   name: 'Pouch of Gems',   gems: 100, price: '$4.99',  icon: '◆◆',   desc: 'Enough to feel like a big spender at the rig shop.', tag: 'Best value' },
  { id: 'case',    name: 'Case of Gems',    gems: 250, price: '$9.99',  icon: '◆◆◆',  desc: "Somebody's serious about mining now. Respect." },
  { id: 'vault',   name: 'Vault of Gems',   gems: 600, price: '$19.99', icon: '◆◆◆◆', desc: 'Go big. Skip the small talk entirely.' },
]

// ---------------------------------------------------------------------------
// Timings, in milliseconds.
// ---------------------------------------------------------------------------
export const TICK_MS = 200                       // how often the game loop runs
export const PASSIVE_AD_INTERVAL_MS = 90_000     // free payout, no interaction
export const REWARD_AD_COOLDOWN_MS = 150_000
export const REWARD_AD_DURATION_MS = 180_000
export const BONUS_AD_COOLDOWN_MS = 300_000
export const AD_PLAYBACK_MS = 1_400              // fake "ad is playing" delay
export const OFFLINE_EARN_RATE = 0.2             // 20% of normal rate while away
export const TICKER_ROTATE_MS = 4_200

export const TICKER_MESSAGES = [
  'block accepted // difficulty stable',
  'rig temp nominal',
  'payout scheduled',
  'network hashrate rising',
  'no dropped shares',
  'fan curve adjusted',
]
