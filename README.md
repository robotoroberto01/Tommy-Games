# Tommy-Games

Browser games, hosted as a static site on Vercel.

## Hashline — Idle Mining Co.

An idle/incremental mining game. Tap the hub to mine, buy rigs that orbit it,
keep power and cooling ahead of your rig count or output throttles, upgrade
through five facility tiers, and "fork the chain" to prestige for Genesis Shards.

Single self-contained `index.html` — no build step, no dependencies, no backend.
The only outbound request is a Google Fonts stylesheet.

**Note:** the in-game gem packs are non-functional placeholders. They show a
confirm dialog stating no payment is processed and then just grant gems. There is
no payment code and no data leaves the browser.

### Running locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000
