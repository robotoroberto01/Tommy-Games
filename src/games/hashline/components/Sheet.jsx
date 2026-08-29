import { useEffect, useState } from 'react'
import MapPanel from './panels/MapPanel.jsx'
import PowerPanel from './panels/PowerPanel.jsx'
import PrestigePanel from './panels/PrestigePanel.jsx'
import ShopPanel from './panels/ShopPanel.jsx'

const PANELS = {
  power: { title: 'Power Grid', icon: '🔋', Body: PowerPanel },
  map: { title: 'Expedition Map', icon: '🗺️', Body: MapPanel },
  shop: { title: 'The Shop', icon: '◆', Body: ShopPanel },
  prestige: { title: 'Fork the Chain', icon: '♻️', Body: PrestigePanel },
}

/**
 * The bottom sheet. One shell, four possible contents.
 *
 * The overlay stays mounted so the slide-up and slide-down both animate, but
 * only the panel you opened is rendered inside it — the other three don't
 * exist in the DOM and cost nothing.
 */
export default function Sheet({ openPanel, onClose }) {
  // Remember the last panel so its content is still there while the sheet
  // slides back down, instead of blanking out halfway through.
  //
  // Adjusting state during render like this is a supported React pattern for
  // "derive from a prop but keep the old value". It's better than doing it in
  // an effect, which would render once with the wrong value and then again with
  // the right one.
  const [lastPanel, setLastPanel] = useState(openPanel)
  if (openPanel && openPanel !== lastPanel) setLastPanel(openPanel)

  const panel = PANELS[lastPanel]
  const isOpen = Boolean(openPanel)

  // Escape closes it, same as tapping the backdrop.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  return (
    <div
      className={`modal-overlay${isOpen ? ' show' : ''}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal-sheet">
        <div className="modal-head">
          <div className="grabber" />
          <span className="modal-ico">{panel?.icon}</span>
          <span className="modal-title">{panel?.title}</span>
          <button type="button" className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">{panel && <panel.Body />}</div>
      </div>
    </div>
  )
}
