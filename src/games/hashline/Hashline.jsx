import { useEffect, useState } from 'react'
import CapacityScreen from './components/CapacityScreen.jsx'
import CrewScreen from './components/CrewScreen.jsx'
import MarketScreen from './components/MarketScreen.jsx'
import NavBar from './components/NavBar.jsx'
import RebuildScreen from './components/RebuildScreen.jsx'
import RigsScreen from './components/RigsScreen.jsx'
import SiteBackdrop from './components/SiteBackdrop.jsx'
import SitesScreen from './components/SitesScreen.jsx'
import Toast from './components/Toast.jsx'
import { startGameLoop } from './store.js'
import './hashline.css'

// The five tabs, plus Sites — which isn't in the nav because you reach it by
// tapping the "next site" strip on the Rigs screen, where it's actually
// relevant. It has its own back button.
const SCREENS = {
  rigs: RigsScreen,
  capacity: CapacityScreen,
  crew: CrewScreen,
  market: MarketScreen,
  rebuild: RebuildScreen,
  sites: SitesScreen,
}

/**
 * The whole game.
 *
 * This component owns only *interface* state — which tab you're looking at. All
 * the actual game state (coins, rigs, crew) lives in store.js and is read by
 * whichever component needs it. See the long comment at the top of that file
 * for why it works that way.
 */
export default function Hashline() {
  const [tab, setTab] = useState('rigs')

  // Start the tick loop when the game mounts, stop it when you leave.
  // startGameLoop returns its own cleanup function.
  useEffect(() => startGameLoop(), [])

  const Screen = SCREENS[tab] ?? RigsScreen

  return (
    <div className="hashline">
      <SiteBackdrop />
      <Screen onNavigate={setTab} />
      <NavBar tab={tab} onChange={setTab} />
      <Toast />
    </div>
  )
}
