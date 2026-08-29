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

/**
 * A coin amount.
 *
 * This used to prefix a coin emoji. It doesn't any more — the redesign carries
 * "this is money" with the yellow accent and the COINS label instead, so the
 * emoji was just noise in the middle of a number. Kept as its own function
 * because plenty of call sites read better saying "coinStr" than "fmt".
 */
export function coinStr(n) {
  return fmt(n)
}

/** Milliseconds until a deadline, as whole seconds, floored at 0. */
export function secondsUntil(timestamp, now = Date.now()) {
  return Math.max(0, Math.ceil((timestamp - now) / 1000))
}

/**
 * A rough stretch of time, for "how far off is my next site".
 *
 * Deliberately coarse — two units at most. Nobody needs "2d 1h 14m 6s", and a
 * seconds field that ticks every second on a two-day estimate is just noise.
 */
export function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return 'not at this rate'
  if (seconds <= 0) return 'now'

  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${secs}s`
  return `${secs}s`
}

/** A 0-1 chance as a percentage string: 0.28 -> "28%", 0.025 -> "2.5%" */
export function pct(fraction) {
  const value = fraction * 100
  return `${value < 10 ? value.toFixed(1) : Math.round(value)}%`
}
