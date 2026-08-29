import { useEffect, useRef, useState } from 'react'
import { MYSTERY_BAD_KINDS } from '../data.js'
import { subscribeToEvents } from '../store.js'

/**
 * The pill that slides in at the top.
 *
 * Listens for 'toast' events from the store. Each new message resets the timer,
 * so a burst of purchases doesn't leave a stale one hanging around.
 *
 * Mystery Crate results carry a `tone` (the outcome's kind), which colours the
 * pill green or red — you should be able to tell at a glance whether the crate
 * went your way without reading the whole line.
 */
export default function Toast() {
  const [message, setMessage] = useState('')
  const [tone, setTone] = useState('')
  const [visible, setVisible] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    const unsubscribe = subscribeToEvents((event) => {
      if (event.type !== 'toast') return
      setMessage(event.text)
      setTone(
        event.tone ? (MYSTERY_BAD_KINDS.includes(event.tone) ? 'bad' : 'good') : '',
      )
      setVisible(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setVisible(false), 2600)
    })
    return () => {
      unsubscribe()
      clearTimeout(timer.current)
    }
  }, [])

  return (
    <div className={`toast${visible ? ' show' : ''}${tone ? ' ' + tone : ''}`}>
      {message}
    </div>
  )
}
