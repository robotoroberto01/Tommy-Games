import { useEffect, useRef, useState } from 'react'
import { subscribeToEvents } from '../store.js'

/**
 * The little green pill that slides in at the top.
 *
 * Listens for 'toast' events from the store. Each new message resets the timer,
 * so a burst of purchases doesn't leave a stale message hanging around.
 */
export default function Toast() {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    const unsubscribe = subscribeToEvents((event) => {
      if (event.type !== 'toast') return
      setMessage(event.text)
      setVisible(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setVisible(false), 2600)
    })
    return () => {
      unsubscribe()
      clearTimeout(timer.current)
    }
  }, [])

  return <div className={`toast${visible ? ' show' : ''}`}>{message}</div>
}
