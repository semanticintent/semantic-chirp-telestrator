# Decisions

*Short records of the choices that shape everything downstream. One entry per decision. Append; do not rewrite history. Status is `decided`, `open`, or `superseded by Dn`.*

Last updated 2026-09-04 (evening).

---

## D1 — Separate repo, never imports CHIRP — decided

`semantic-chirp-telestrator` is its own repo. The screen reaches the analyst over HTTP or from `fixtures/`; the shape is identical either way. No import, no shared build. A separate repo enforces the boundary for free and keeps the page's dependencies out of the MCP server's.

## D2 — The read contract lives here, CHIRP vendors it — decided

`contracts/read.schema.json` is owned by the consumer: the screen defines what it can draw. CHIRP keeps a vendored copy under its own `contracts/` and runs a test that diffs the two files byte for byte. Publishing the schema as an npm package is deferred until a second consumer exists.

Why here and not in CHIRP: the schema is the list of things the screen knows how to draw, and it changes when a view changes. The analyst adapts to the screen's vocabulary, not the other way round.

## D3 — Ids are opaque strings — decided

`skater.id` is whatever the analyst assigns. Live CHIRP uses the NHL player id. Fixtures use slugs (`zary`, `gridin`) so scenarios stay readable. The screen never parses, slugifies, or matches names against ids. The producer console may offer name-to-id convenience for humans typing; that convenience is not a tool and is not registered with WebMCP.

## D4 — The screen computes nothing; the contract carries every line — decided

The v0 mockup computed start/sit by sorting, projected points by multiplication, replay verdict lines, the games-in-hand caption, and an automatic replay comparator. None of that is ported. The contract now carries `projected_pts`, `verdicts[]`, `games_in_hand.take`, `take`, `reason`, and `window.labels` so that views only lay out what they are given. Layout math on read values (scaling a 0–100 to a bar width) is allowed. Deriving a new fact (a comparison, a sum, a sort across skaters, a sentence) is not.

Test that enforces it: every rendered text node must appear either in the fixture or in `src/copy.js` (static interface copy). See ARCHITECTURE.md → Verification.

## D5 — A circle persists until wiped or replaced — decided

The pattern doc says the screen remembers; the mockup faded the circle after 4.2 s. State wins. `state.circle` stays until `wipe()` or the next `circle()`. Motion may dim the spotlight to a ring after a few seconds; the callout stays. Only one circle at a time in v1 (`ids[0]`); multi-circle waits for layers.

## D6 — `replay(id)` shows one; `split(a, b)` shows two; no auto-comparator — decided

Choosing the foil is the pen's move or the analyst's call, never the screen's. `replay` with one id draws one row and the matching single-id verdict, if any. `split` draws two rows and the matching pair verdict. No verdict match means the sequence runs without a closing line.

## D7 — `cue_roster` under fixtures loads a fixture; live, it posts text to the analyst — decided

Roster resolution (names → players, ambiguity reporting) is CHIRP's job and already exists there (`RosterStore`). The screen never parses roster text. In fixture mode `cue_roster` takes a fixture name. In live mode it posts the pasted text and receives `skaters[]` with slots.

## D8 — Views emit end values; sequences own only time — decided

A view renders every element in its final state, with `data-*` attributes for anything a sequence needs (`data-to-width`, `data-cx`, `data-cy`, `data-r`). A sequence step is `{ at, target, do, duration?, ease?, stagger? }` and never contains a computed value. The runner reads the end value from the element. This keeps sequence JSON free of expressions and keeps meaning out of motion.

## D9 — Partial re-render driven by `touches` — decided

`render(state)` rebuilds only the views named in the last move's `touches`. A full rebuild on every move would destroy in-flight tweens and spotlight targets. Idempotency is tested by rendering the same state twice and comparing markup per view.

## D10 — Fixtures first; the analyst track runs in parallel — decided

Screen tasks 1–3 run entirely on fixtures. The CHIRP-side `read_ice` (a new analysis emitting this contract, plus an HTTP entry point) is a separate track in the CHIRP repo and is the true critical path. Wiring happens in screen task 4. See `docs/plan.md`.

## D11 — Live transport is stateless HTTP, local first — decided

CHIRP v4 is stdio and keeps the roster on disk. The screen path needs neither. A small `chirp-http` entry in the CHIRP repo exposes `POST /read` taking `{ roster_text, look_ahead_days, opponent_text? }` and returning a Read. No stored roster, no auth, CORS open to the page's origin. Runs on localhost for the demo. Remote hosting behind Signet is a later decision, not a blocker.

## D12 — Team colours come from `skater.club` via a token map — decided

The mockup hardcoded one club's jersey colours inline. `tokens.css` carries a `--club-XXX` pair per NHL tricode and a neutral pair. Generic jersey shapes only; no logos, wordmarks, or jersey designs.

## D13 — Stack — decided

Vanilla ES modules, SVG, GSAP (npm, bundled), Vite, `vite-plugin-singlefile` for `dist/telestrator.html`, Vitest for unit and contract tests, Playwright for scenarios, Ajv for schema validation. Barlow is inlined into the single-file build; the dev server may load it from Google Fonts. Check each package against the rules in the user's global CLAUDE.md before installing; report weekly downloads and last publish date for anything not already in the ecosystem.

## D14 — GitHub repo — open

Recommendation: public under `semanticintent/semantic-chirp-telestrator`, MIT, matching the CHIRP repo. Create after task 1 lands so the first public commit already runs. **Needs a yes.**

## D15 — Where the page is hosted — decided

Cloudflare Pages is the canonical URL (existing infra, same as the CHIRP docs site). The single-file `dist/telestrator.html` is what gets deployed. Registration with whichever WebMCP hosts are live happens at S4; the overview's ChatGPT Sites claim is verified then, not assumed.

## D16 — WebMCP API surface — verified against the primary spec, closed

**Re-checked 2026-09-04 against the W3C Community Group Draft Report itself (dated 4 September 2026).** Three corrections to the mockup's assumptions: `execute(input, { signal })` resolves to any JSON-serializable value, not MCP content blocks, so the ack goes back as-is; there is no `unregisterTool`, registration is undone by aborting the `signal` passed in the options; and descriptors carry optional `title` and `annotations` (`readOnlyHint`, `consequentialHint`, `untrustedContentHint`), which `src/webmcp.js` fills. The API needs a secure context. The adapter looks for `navigator.modelContext` and falls back to `document.modelContext`, since the draft's prose and the ecosystem's examples disagree on the attachment point. Earlier note, from secondary sources: checked 2026-09-04 against secondary sources on the W3C Community Group Draft Report (latest publication 23 April 2026). The mockup's shape is current: `navigator.modelContext.registerTool({ name, description, inputSchema, execute })`, with `unregisterTool(name)`. `provideContext()` and `clearContext()` were removed in the March 2026 revision. Chrome 146 stable (10 March 2026) ships WebMCP behind the `enable-webmcp-testing` flag, off by default. So S4 targets that flag for local demos and treats other hosts as verify-at-the-time. `src/webmcp.js` derives registration from `grammar.js`, so a later signature change is one adapter. Re-check the primary spec text at S4 before shipping.

## D17 — Generated docs live in `scripts/` — decided

`scripts/grammar-doc.mjs` writes `docs/grammar.md` from `grammar.js` (via Vite's SSR loader so `import.meta.glob` resolves). `test/grammar.spec.js` fails if the doc drifts. New top-level directory added under the standing "make your best call" on S1 follow-ups.

## D18 — Replay bars are one colour — decided

The mockup coloured the first skater's projected-points bar green and the second grey, which hints at a favourite. Under D6 the screen picks no favourite, so both bars are the same amber. The analyst's verdict line is the only place a call appears.

## D19 — The console echoes, and is the one view exempt from the no-opinions test — decided

The talkback console shows the transcript: every move made on this screen by anyone, and its ack. Those strings are not in the read and not in copy; they are what was said. So `test/no-opinions.spec.js` skips the console view, and `test/console.spec.js` holds it to exactly the transcript, the grammar-derived hints, and copy. Nothing else may appear there either.

## D20 — The transcript lives in state — decided

`state.log` is appended by `dispatch.call` after every move, from any caller (scenario runner, talkback, later WebMCP), never by a handler. `wipe` and `cue_roster` leave it alone. The console re-renders on every call regardless of the move's `touches`. Capped at 200 entries. Reload with the same state and the same transcript is on screen, which is what the pattern doc's screen-memory idea needs.

## D21 — Talkback surnames are a console convenience, not a tool — decided

Grammar inputs now have an `id` type (`id`, `id[]`). `src/talkback.js` swaps a typed surname for an id only where the grammar expects an id, only when it names exactly one skater in the read, and only on the console path. `run()` and `call()` never do this, so an agent must use ids (D3).

## D22 — `prepare` is the one impure step, and it lives beside the handler — decided

Live reads need a network call, and handlers are pure. A grammar entry may declare `prepare(input, state) → Promise<input>`, run by dispatch before the handler. It fetches from the analyst through `src/analyst.js` and puts the Read into the input; the handler then does what it always did. Only `cue_roster` and `read_ice` have one. Fixture mode and live mode meet at the same handler with the same input shape.

## D23 — The screen validates live reads with a validator that walks the schema file — decided

`src/contract.js` implements the JSON Schema subset the contract uses (type, required, enum, const, properties, additionalProperties, items, min/max, minLength, pattern, format for date and date-time, uniqueItems) plus the cross-field rules (bits per day, ids resolve). It reads `contracts/read.schema.json` directly, so there is still one source of truth. `test/contract.spec.js` holds it to agreement with Ajv on the fixtures and a dozen mutations. Ajv stays a dev dependency; it does not ship in the page.

## D24 — Deploy scaffold now, deploy when the analyst is live — decided

`wrangler.jsonc` declares a Pages project `chirp-telestrator` with `pages_build_output_dir: dist` (the lesson from the CHIRP docs site: a Worker-shaped config against a Pages project deploys nowhere). `npm run deploy` builds and deploys. The build emits `dist/index.html` for Pages and the identical `dist/telestrator.html` for sharing. Not deployed yet: the repo is private until ready, and a page with no live analyst behind it is not ready. First deploy follows A3.

## D25 — Fonts are inlined — decided

Barlow and Barlow Condensed (latin subset, six faces, 104 kB, SIL OFL 1.1 with the licence in `src/fonts/`) are bundled as data URIs into the single file. No request leaves the page for type. The single file is 250 kB.

## D26 — What the agent hosts actually are — recorded

The Codex / ChatGPT desktop app has an embedded browser that can call WebMCP tools; ChatGPT Sites (`*.chatgpt.site`) is its hosting and test environment, where the user has published before (Orbweaver). So the demo path is: page on Cloudflare Pages (canonical) and, when useful, the same single file on a Site; Chrome with the flag for local checks. Corrects the Desktop session's overview, which had this half right.
