# semantic-chirp-telestrator

The telestrator: a WebMCP page that draws CHIRP's fantasy-hockey reads onto a persistent visual surface. CHIRP is the analyst. Any WebMCP agent is the pen. This page is the screen.

Live at https://chirp-telestrator.pages.dev, reading from the hosted analyst. Paste a lineup in the talkback, then `read_ice 7 2026-10-12`. Add `?analyst=fixtures` for the built-in fixtures, or `?analyst=http://localhost:3200` for a local CHIRP. Start with `CLAUDE.md`, then `ARCHITECTURE.md`, then `docs/`.

```
npm install
npm run dev          # then open http://localhost:5173 and type read_ice in the talkback
npm test             # contract, views, no-opinions, console, grammar, webmcp
npm run scenarios    # plays scenarios/*.txt through Playwright, screenshots to test/shots/
npm run build        # dist/telestrator.html, one file, fonts inlined
npm run deploy       # Cloudflare Pages
```

With an analyst running: `http://localhost:5173/?analyst=http://localhost:3100`, then paste a lineup in the talkback.

- `docs/overview.md` — what we're after
- `docs/pattern.md` — the telestrator pattern
- `docs/decisions.md` — what has been decided and what is still open
- `docs/plan.md` — the two-track plan
- `contracts/read.schema.json` — what the analyst returns; the only thing the screen may draw
- `fixtures/` — reads the screen can run without an analyst
- `scenarios/` — one move per line; the producer console and the tests both speak them
- `reference/telestrator-v0.html` — the visual target. Rebuild it properly; do not edit it.

Analyst: [semantic-chirp-intelligence-mcp](https://github.com/semanticintent/semantic-chirp-intelligence-mcp).
