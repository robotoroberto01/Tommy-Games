import { Navigate, Route, Routes } from 'react-router-dom'
import { GAMES } from './games/registry.js'
import Arcade from './pages/Arcade.jsx'

// Routes are built from the games registry, so adding a game to that list is
// enough to give it a working URL. Nothing here needs to change.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Arcade />} />
      {GAMES.map(({ slug, Component }) => (
        <Route key={slug} path={`/${slug}`} element={<Component />} />
      ))}
      {/* Anything unrecognised goes back to the arcade. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
