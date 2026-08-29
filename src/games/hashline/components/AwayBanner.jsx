import { useEffect, useState } from 'react'
import { fmt, formatDuration } from '../format.js'
import Icon from '../icons.jsx'
import { offlineRate, offlineWindowHours, subscribeToEvents, useGame } from '../store.js'

/**
 * "While you were away…"
 *
 * The old version of this was a 2.6-second toast, which you miss if you weren't
 * already looking at the screen — and coming back to the app is exactly the
 * moment you aren't. This sticks around until dismissed, because seeing that it
 * kept running while you were gone is the whole point of an idle game.
 *
 * It lives at the root rather than inside a screen, so it shows up whichever tab
 * you happened to leave the game on.
 */
export default function AwayBanner() {
  const [away, setAway] = useState(null)
  const rate = useGame((s) => Math.round(offlineRate(s) * 100))
  const hours = useGame(offlineWindowHours)

  useEffect(
    () =>
      subscribeToEvents((event) => {
        if (event.type !== 'away') return
        setAway({ earned: event.earned, seconds: event.seconds, cappedOut: event.cappedOut })
      }),
    [],
  )

  if (!away) return null

  return (
    <div className="away">
      <span className="away-icon">
        <Icon name="clock" size={18} />
      </span>
      <span className="away-body">
        <span className="away-title">
          Earned {fmt(away.earned)} while you were away
        </span>
        <span className="away-meta">
          {formatDuration(away.seconds)} at {rate}% rate
          {away.cappedOut
            ? ` · stopped at your ${hours}h limit`
            : ''}
        </span>
      </span>
      <button
        type="button"
        className="away-close"
        onClick={() => setAway(null)}
        aria-label="Dismiss"
      >
        <Icon name="close" size={14} />
      </button>
    </div>
  )
}
