/**
 * Shorten big numbers so they fit on screen: 1234 -> "1.23K", 5e9 -> "5.00B".
 * Idle games get to absurd numbers fast, so this goes up to quadrillions.
 */
export function fmt(n) {
  // Each threshold sits a hair BELOW the round number on purpose. Cutting over
  // at exactly 1e6 meant 999,999.99 divided by 1e3 rounded to 1000.00 and
  // printed "1000.00K" — a unit too small. Comparing against 999.995 promotes
  // it to "1.00M" instead. Same at every boundary.
  if (n >= 999.995e12) return (n / 1e15).toFixed(2) + 'Q'
  if (n >= 999.995e9) return (n / 1e12).toFixed(2) + 'T'
  if (n >= 999.995e6) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 999.995e3) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 999.995) return (n / 1e3).toFixed(2) + 'K'
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

/**
 * The big balance at the top of the screen.
 *
 * Deliberately NOT fmt(). fmt shortens anything over a thousand, which means at
 * 1,340 coins it shows "1.34K" — and a +0.10 tap then changes nothing on screen
 * for a hundred taps. Tapping has to feel like it did something.
 *
 * So: full digits with separators while they still fit, and only then fall back
 * to shortening. By the time the number is that big, income dwarfs a single tap
 * anyway and there's nothing left to show.
 */
export function fmtBalance(n) {
  if (n < 1e6) {
    return n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
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
