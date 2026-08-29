// Which tab is actually playing.
//
// ---------------------------------------------------------------------------
// THE PROBLEM THIS SOLVES
// ---------------------------------------------------------------------------
// Every open tab used to run its own copy of the game: its own loop, its own
// income, its own saves. Two tabs meant two different balances, and whichever
// saved last silently overwrote the other one's progress.
//
// So exactly one tab is ACTIVE at a time. The active tab runs the loop and
// writes the save; the others go quiet, stop earning, and show a "playing in
// another tab" screen with a button to take over.
//
// ---------------------------------------------------------------------------
// HOW THE ELECTION WORKS
// ---------------------------------------------------------------------------
// Tabs talk over a BroadcastChannel, and the rule is simply LAST CLAIM WINS:
//
//   * claiming makes you active and tells everyone else
//   * hearing someone else's claim makes you passive
//
// Because messages arrive in order, whoever claimed last ends up as the only
// active tab, even when several claim at once. When the active tab closes it
// says so, and the passive tabs re-claim after a short random delay — the jitter
// means they don't all shout at the same instant, and last-claim-wins settles
// whoever does.
//
// If BroadcastChannel isn't available the tab just stays active forever, which
// is the old behaviour: no worse than before, and no crash.

const CHANNEL_NAME = 'hashline.activeTab'

const MESSAGE = {
  CLAIM: 'claim',
  RELEASE: 'release',
}

function makeId() {
  try {
    return crypto.randomUUID()
  } catch {
    return `tab-${Math.random().toString(36).slice(2)}`
  }
}

const myId = makeId()

let channel = null
let active = true
let listeners = new Set()

function setActive(next) {
  if (active === next) return
  active = next
  for (const listener of listeners) listener(active)
}

/** Is this tab the one actually playing? */
export function isActiveTab() {
  return active
}

/** Take over. The other tabs will go passive when they hear this. */
export function claimActiveTab() {
  setActive(true)
  channel?.postMessage({ type: MESSAGE.CLAIM, id: myId })
}

/**
 * Start listening. Returns a cleanup function.
 *
 * `onChange(active)` fires whenever this tab gains or loses control, so the UI
 * can show the takeover screen and the store can stop ticking.
 */
export function watchActiveTab(onChange) {
  listeners.add(onChange)

  if (!channel) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME)
    } catch {
      // No BroadcastChannel: stay active, behave exactly as before.
      return () => listeners.delete(onChange)
    }

    channel.onmessage = (event) => {
      const message = event.data
      if (!message || message.id === myId) return

      if (message.type === MESSAGE.CLAIM) {
        // Someone else took over.
        setActive(false)
      } else if (message.type === MESSAGE.RELEASE) {
        // The active tab went away. Re-claim, but jitter so several passive
        // tabs don't all claim on the same tick — last claim wins, and the
        // jitter decides who that is.
        setTimeout(() => {
          if (!active) claimActiveTab()
        }, Math.random() * 250)
      }
    }

    // Announce ourselves. Any tab already open hears this and steps aside.
    claimActiveTab()

    window.addEventListener('pagehide', handlePageHide)
  }

  return () => listeners.delete(onChange)
}

function handlePageHide() {
  if (active) {
    channel?.postMessage({ type: MESSAGE.RELEASE, id: myId })
  }
}
