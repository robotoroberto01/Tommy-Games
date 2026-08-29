import { COIN } from './data.js'

/**
 * Shorten big numbers so they fit on screen: 1234 -> "1.23K", 5e9 -> "5.00B".
 * Idle games get to absurd numbers fast, so this goes up to quadrillions.
 */
export function fmt(n) {
  if (n >= 1e15) return (n / 1e15).toFixed(2) + 'Q'
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K'
  return n.toFixed(2)
}

/** Same as fmt, with the coin on the front: "🪙1.23K" */
export function coinStr(n) {
  return COIN + fmt(n)
}

/** Milliseconds until a deadline, as whole seconds, floored at 0. */
export function secondsUntil(timestamp, now = Date.now()) {
  return Math.max(0, Math.ceil((timestamp - now) / 1000))
}
