// The list of games on the site.
//
// ---------------------------------------------------------------------------
// TO ADD A NEW GAME
// ---------------------------------------------------------------------------
//   1. Make a folder: src/games/your-game/
//   2. Put a component in it that renders the whole game, e.g. YourGame.jsx
//   3. Import it below and add one entry to GAMES
//
// That's it. The arcade page on / builds its list from this array, and App.jsx
// builds the routes from it, so nothing else needs editing. The `slug` becomes
// the URL: slug 'hashline' is served at /hashline.
//
// Games do not share state or styles with each other on purpose — each folder
// is self-contained, so changing one can never break another.

import Hashline from './hashline/Hashline.jsx'

export const GAMES = [
  {
    slug: 'hashline',
    title: 'Hashline',
    tagline: 'Idle Mining Co.',
    blurb:
      'Tap to mine, buy rigs that orbit your hub, and keep power and cooling ahead of the heat. Climb from a garage to orbit, then fork the chain and do it all again faster.',
    icon: '⛏️',
    accent: '#00D9FF',
    Component: Hashline,
  },
]

export function findGame(slug) {
  return GAMES.find((game) => game.slug === slug)
}
