import { useEffect, useState } from 'react'
import { claimActiveTab, watchActiveTab } from '../activeTab.js'
import Icon from '../icons.jsx'
import { adoptSavedState } from '../store.js'

/**
 * Shown when the game is being played in a different tab.
 *
 * Only one tab runs the game — see activeTab.js for why. This is the other
 * tabs' view: a plain explanation and a button to move the game here.
 *
 * It covers the screen rather than sitting in a corner, because a passive tab's
 * numbers are frozen and quietly showing stale figures is exactly the confusion
 * this is meant to end.
 */
export default function InactiveTab() {
  const [active, setActive] = useState(true)

  useEffect(() => watchActiveTab(setActive), [])

  if (active) return null

  function takeOver() {
    // Pick up wherever the other tab got to before running the loop here.
    claimActiveTab()
    adoptSavedState()
  }

  return (
    <div className="inactive">
      <div className="inactive-box">
        <span className="inactive-icon">
          <Icon name="warning" size={26} />
        </span>
        <div className="inactive-title">Playing in another tab</div>
        <p className="inactive-copy">
          The game only runs in one tab at a time, so your progress can&apos;t get
          split between them. This one is paused.
        </p>
        <button type="button" className="btn-primary" onClick={takeOver}>
          Play here instead
        </button>
      </div>
    </div>
  )
}
