import { useEffect, useState } from 'react'
import { TICKER_MESSAGES, TICKER_ROTATE_MS } from '../data.js'
import { coinStr, fmt } from '../format.js'
import {
  getState,
  powerCapacity,
  powerUsed,
  ratePerSec,
  subscribeToEvents,
  throttleMultiplier,
  useGame,
} from '../store.js'

function randomFlavour() {
  return TICKER_MESSAGES[Math.floor(Math.random() * TICKER_MESSAGES.length)]
}

function statusLine() {
  const rate = ratePerSec(getState())
  if (rate <= 0) return randomFlavour()
  return `earning ${fmt(rate)} coins/s // ${randomFlavour()}`
}

/**
 * The scrolling status line under the meters.
 *
 * A throttle warning always wins — if power or cooling is overrun you need to
 * see that, not flavour text. Otherwise it rotates every few seconds, and the
 * passive ad payout interrupts it when one lands.
 */
export default function Ticker() {
  const [message, setMessage] = useState(statusLine)

  const throttled = useGame((s) => throttleMultiplier(s) < 0.999)
  const overPower = useGame((s) => powerUsed(s) > powerCapacity(s))

  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return
      setMessage(statusLine())
    }, TICKER_ROTATE_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(
    () =>
      subscribeToEvents((event) => {
        if (event.type === 'ticker') {
          setMessage(`ad impression served // +${coinStr(event.payout)} credited`)
        }
      }),
    [],
  )

  const warning = overPower
    ? '⚠ power draw exceeds capacity // output throttled'
    : '⚠ rigs overheating // output throttled — add cooling'

  return (
    <div className="ticker">
      <div className={`ticker-inner${throttled ? ' warn' : ''}`}>
        {throttled ? warning : message}
      </div>
    </div>
  )
}
