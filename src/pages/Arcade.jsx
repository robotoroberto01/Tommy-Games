import { Link } from 'react-router-dom'
import { GAMES } from '../games/registry.js'
import './arcade.css'

// The front page. Everything it shows comes from src/games/registry.js — to
// change what's listed here, edit that file, not this one.
export default function Arcade() {
  return (
    <div className="arcade">
      <div className="arcade-glow" aria-hidden="true" />

      <header className="arcade-head">
        <div className="arcade-brand">
          <span className="arcade-dot" />
          <span>TOMELONE</span>
        </div>
        <h1 className="arcade-title">Tommy&apos;s Arcade</h1>
        <p className="arcade-sub">
          Games made for the browser. No downloads, no accounts, nothing to install —
          just open one and play.
        </p>
      </header>

      <main className="arcade-grid">
        {GAMES.map((game) => (
          <Link
            key={game.slug}
            to={`/${game.slug}`}
            className="arcade-card"
            style={{ '--accent': game.accent }}
          >
            <div className="arcade-card-icon">{game.icon}</div>
            <div className="arcade-card-body">
              <div className="arcade-card-title">{game.title}</div>
              <div className="arcade-card-tagline">{game.tagline}</div>
              <p className="arcade-card-blurb">{game.blurb}</p>
            </div>
            <div className="arcade-card-cta">Play →</div>
          </Link>
        ))}

        <div className="arcade-soon">
          <div className="arcade-soon-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
                   strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
          <div>
            <div className="arcade-soon-title">More coming</div>
            <div className="arcade-soon-text">
              New games land here as they&apos;re built.
            </div>
          </div>
        </div>
      </main>

      <footer className="arcade-foot">
        Built by Tommy · <span className="arcade-foot-dim">tomelone.com</span>
      </footer>
    </div>
  )
}
