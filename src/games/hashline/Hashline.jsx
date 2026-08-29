import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import ManagersPage from './components/ManagersPage.jsx'
import MenuBar from './components/MenuBar.jsx'
import Sheet from './components/Sheet.jsx'
import Stage from './components/Stage.jsx'
import Toast from './components/Toast.jsx'
import { startGameLoop } from './store.js'
import './hashline.css'

/**
 * The whole game.
 *
 * This component owns only *interface* state — which panel is open. All the
 * actual game state (coins, rigs, managers) lives in store.js and is read by
 * whichever component needs it. See the long comment at the top of that file
 * for why it works that way.
 */
export default function Hashline() {
  // Which bottom sheet is showing: null, 'power', 'map', 'shop' or 'prestige'.
  const [sheet, setSheet] = useState(null)
  // The managers screen is a full-page overlay rather than a sheet.
  const [managersOpen, setManagersOpen] = useState(false)

  // Start the tick loop when the game mounts, stop it when you leave.
  // startGameLoop returns its own cleanup function.
  useEffect(() => startGameLoop(), [])

  return (
    <div className="hashline">
      <Header onOpenMap={() => setSheet('map')} />
      <Stage />
      <MenuBar
        onOpenSheet={setSheet}
        onOpenManagers={() => setManagersOpen(true)}
      />

      <Sheet openPanel={sheet} onClose={() => setSheet(null)} />
      <ManagersPage open={managersOpen} onClose={() => setManagersOpen(false)} />
      <Toast />
    </div>
  )
}
