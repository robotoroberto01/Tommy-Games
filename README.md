# Tommy-Games

Browser games, hosted at **[tomelone.com](https://tomelone.com)**.

Nothing to install for players — they open a link and play. No accounts, no
downloads, no backend, no data collected.

---

## Running it on your computer

You need [Node.js](https://nodejs.org) installed (any recent version). Then, in
this folder:

```bash
npm install
```

You only have to do that once. After that, to work on the site:

```bash
npm run dev
```

That prints a link like `http://localhost:5173` — open it in your browser. Leave
it running while you work: when you save a file, the page updates by itself.

Press `Ctrl+C` in the terminal to stop it.

---

## How the site is put together

```
src/
  pages/Arcade.jsx        the front page, listing every game
  games/registry.js       the list of games — the front page reads this
  games/hashline/         one folder holding all of Hashline
    Hashline.jsx            the game's main component
    data.js                 all the numbers (prices, names, timings)
    store.js                the rules and the game loop
    format.js               number formatting helpers
    hashline.css            all of Hashline's styling
    components/             the individual pieces of the screen
```

The important idea: **each game lives entirely in its own folder.** Nothing in
`games/hashline/` is shared with any other game, so changing one game can never
break another.

### Want to change how Hashline plays?

Almost every balance change is in **`src/games/hashline/data.js`** — how much
each rig costs, how much it earns, how long a boost lasts, what things are
called. Start there. You rarely need to touch anything else.

### Want to change what something looks like?

**`src/games/hashline/hashline.css`** for the game, `src/pages/arcade.css` for
the front page.

### Want to add a whole new game?

1. Make a new folder in `src/games/`
2. Put a component in it that draws your game
3. Add one entry to `src/games/registry.js`

The front page and the URL are wired up automatically from that list.

---

## Publishing changes

The site rebuilds and redeploys itself whenever `main` changes on GitHub. So:

```bash
git add -A
git commit -m "describe what you changed"
git push
```

Wait about a minute, then reload tomelone.com.

Before you push, it's worth running these two to catch mistakes early:

```bash
npm run build
```

If that prints an error, something is broken and the deploy would fail too — fix
it before pushing.

---

## Games

### Hashline — Idle Mining Co.

An idle game. Tap the hub to mine, buy rigs that orbit it, and keep power and
cooling ahead of your rig count or your output gets throttled. Work up through
five sites from a garage to orbit, hire managers to boost each tier, then "fork
the chain" to trade your progress for Genesis Shards that make the next run
faster.

**Note on the gem packs:** the `$1.99` / `$4.99` buttons in the shop are
placeholders and charge nobody anything. Tapping one shows a dialog saying so,
then just grants the gems. There is no payment code anywhere in this project and
no payment provider connected. If you ever want real purchases, that's a much
bigger conversation — don't just wire a payment form to those buttons.

**Progress isn't saved yet.** Reloading the page starts a fresh run. Adding
saving is a small change and there are instructions for exactly how at the bottom
of `src/games/hashline/store.js`.
