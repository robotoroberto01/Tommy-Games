# Working in this repo

Notes for Claude (or any AI assistant) making changes here.

## Context

This is a personal side project — a small collection of browser games, owned by
someone who is early in learning web development and who will mostly be directing
changes through an AI assistant rather than writing the code themselves.

That shapes what "good" means here:

- **Explain changes in plain language.** Say what you changed and why in terms of
  the game, not just the code.
- **Prefer boring, obvious code** over clever code. It has to stay readable to
  someone learning.
- **Don't add dependencies** unless there's no reasonable alternative. Every new
  package is something else that can break and need updating. The whole site
  currently runs on React and React Router and nothing else.
- **Don't introduce TypeScript, a CSS framework, or a state library** without
  being asked. Those are real decisions to make deliberately, not side effects of
  some other task.
- **Keep the comments.** The existing comments explain *why*, and they're load-
  bearing documentation for someone still learning. Don't strip them when editing
  nearby code.

## Stack

Vite + React 19, plain JavaScript, plain CSS. React Router for pages. Deployed as
a static site on Vercel — pushing to `main` deploys to production.

```bash
npm run dev      # local dev server with hot reload
npm run build    # must pass before pushing — a failure here fails the deploy
npm run lint     # oxlint
```

## Layout

```
src/pages/Arcade.jsx      front page
src/games/registry.js     the game list — drives both the front page and routing
src/games/<name>/         one self-contained folder per game
```

**Games must stay isolated.** No game imports from another game. No game-specific
code goes in `src/styles/` or anywhere shared. If two games ever genuinely need
the same helper, that's the moment to discuss a shared folder — not before.

## The Hashline store pattern — read this before touching the game

`src/games/hashline/store.js` holds all game state in a plain mutable object
*outside* React, with components subscribing through `useGame(selector)`.

This is deliberate and the file explains why at length: it's an idle game whose
loop runs 5×/second, and putting that in `useState` re-renders the whole tree
5×/second.

**The rule that will bite you:** a selector passed to `useGame` must return a
**primitive** — number, string, or boolean. Never an object or array. React
compares snapshots with `Object.is`, so returning a fresh object every call
causes an infinite render loop. Need several values? Call `useGame` several
times.

Prefer selecting the *derived answer* over the raw input. `useGame(s => s.balance
>= cost)` re-renders only when affordability flips; `useGame(s => s.balance)`
re-renders 5 times a second.

Anything that *happens* rather than *is* — a tap, a toast — goes through
`subscribeToEvents`, not state.

## Saving

Progress persists to `localStorage` under `hashline.save.v1`. The rules are
documented in `store.js`; the two that matter when editing:

- **Adding a saved field:** add its name to `SAVED_NUMBERS` (or
  `SAVED_COUNT_MAPS`). Do **not** bump `SAVE_VERSION` for this — loading merges
  over defaults, so old saves pick up new fields automatically. Bumping the key
  wipes everyone's progress and is a last resort, only for when an existing
  field changes meaning.
- **Loading must stay defensive.** It iterates the keys `freshState()` defines,
  range-checks every value, and clamps anything used as an index. Don't replace
  that with `Object.assign(state, saved)` — a save written before a new rig
  existed would then leave `rigsOwned` missing that key, and every calculation
  touching it returns `NaN`.

`nextPassiveAdAt` is deliberately not saved: restoring it would let a player
farm the free payout by closing and reopening the tab.

## The gem packs are not real purchases

The `$1.99` / `$4.99` buttons in Hashline's shop are non-functional placeholders.
They show a `window.confirm` stating plainly that nothing is charged, then grant
gems locally. There is no payment provider, no payment code, and no network call.

**Do not wire these to a real payment flow, remove the disclosure dialog, or make
them look more like a real transaction** as a side effect of some other task. If
real purchases are ever wanted, that's a deliberate conversation about payment
providers, app store rules, and — given games attract younger players — consumer
protection rules around selling currency to minors.

## Verifying

There are no automated tests. Before saying a change works:

1. `npm run build` and `npm run lint` both pass.
2. Actually load the page and exercise the thing you changed.

For Hashline specifically, the numbers are checkable by hand — rig costs grow
×1.15 per purchase, tap upgrades ×1.65, managers ×2.2. If a displayed number
doesn't match the formula in `data.js`, that's a real bug.
