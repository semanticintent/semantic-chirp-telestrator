# The Telestrator: A WebMCP Pattern Where the Page Is the Screen, Not the Actor

**Michael Shatny** · Semantic Intent · ORCID 0009-0006-2011-3258
Version 0.1.0 · 5 September 2026 · DOI https://doi.org/10.5281/zenodo.22387039 (this version: 10.5281/zenodo.22387040)
Reference implementation: Sepiola, https://sepiola.semanticintent.dev

## Abstract

WebMCP lets a web page register tools that an agent running in the browser can call. Nearly every example to date uses those tools the way a site's own buttons are used: the page books, buys, submits. The page is the actor. This paper describes the complementary pattern. A page exposes tools that *show* rather than *do*, so that an agent whose intelligence lives elsewhere can draw that intelligence onto a persistent surface the human is also looking at. Three roles are kept apart: an **analyst** (an MCP server or API) that computes, decides, and explains; a **pen** (any WebMCP agent, or a human at a console) that turns a question into a small vocabulary of broadcast moves; and a **screen** (the page) that draws, remembers, and lets the viewer touch. The load-bearing invariant is that the screen has no opinions: every number and every sentence on it comes from the analyst's read, and a mechanical test enforces this. The pattern is demonstrated by Sepiola, a fantasy-hockey telestrator driven by the CHIRP intelligence server, with the analyst hosted on Cloudflare Workers, the screen on Cloudflare Pages, and the seven moves registered against Chromium's real WebMCP implementation. Six findings from building it are reported, including two that would have shipped silently without cross-engine and real-host verification.

## 1. Context

WebMCP is a W3C Community Group draft that adds a `modelContext` object to the browser through which a page registers tools — name, description, JSON input schema, and an `execute` function — for an in-page agent to discover and invoke. The published examples treat the page as a capability: an agent operates the site hands-free. This assumes the page owns the capability. Increasingly it does not. The capability is an MCP server, an API, a model, a library the agent already has. What the agent lacks is a way to present a result that outlives a chat turn and that the human can touch.

Television solved the presentation half of this problem decades ago. During an intermission the analyst has a pen; the game is frozen on the screen; a circle appears around a defender, the play runs back, two clips sit side by side. Three things happen at once: the game is the game, the read is the analyst's, and the telestrator is where the read is drawn onto the game so that everyone watching sees what the analyst sees.

## 2. Problem

Chat is a poor broadcast. Intelligence with shape — a lineup with positions, a schedule with gaps, three options with trade-offs — arrives as a paragraph the viewer must rebuild in their head. A one-off chart is gone with the next message. Interface rendered inside a chat client belongs to that client and is invisible to any other agent, or to a person opening the page alone. The analyst is talking with no screen behind them.

## 3. Forces

- **Persistence.** What was drawn must still be there when the next question is asked.
- **Portability.** The same screen should serve any agent, and still work with no agent at all.
- **Legibility.** The agent's actions should be visible as actions — a circle appearing, a replay running — not inferred from a changed page.
- **Trust.** A call without its reasoning is hard to act on; reasoning without form is hard to follow.
- **Authority.** The intelligence stays the analyst's. The screen must not grow opinions of its own.

## 4. The pattern

**Three roles, one invariant.** The analyst computes, decides, and explains, and returns structure, not prose. The pen turns the viewer's question into calls and adds the take. The screen draws, remembers, and lets the viewer touch. *The screen has no opinions.* If a number or a sentence appears on screen that was not in a read from the analyst, something has leaked.

**A broadcast grammar.** The screen registers a small vocabulary borrowed from television rather than from forms: load the board, read the ice, circle him, run it back, split screen, cut to, wipe. Each is one thing an analyst would do with a pen in hand, each changes what is visible, and each returns a structured acknowledgment of what it drew. The test for adding a verb: if an analyst would not do it with a telestrator, it belongs on the analyst's side.

**A read contract.** The analyst returns a schema the screen can draw from: per entity, the values and flags; per read, the calls, the closing lines, the take, and an identifier the pen can hand back to run it back. Designing this contract is most of the engineering. Every sentence the screen can show is in the contract — reasons, verdicts, the take — so that the port of a mockup cannot quietly recompute them.

**The screen remembers.** Windows stay where they were left; a circle stays until wiped; the transcript of every move, by any pen, is state. The viewer can reach in and move things; the next stroke lands on what is there.

**The screen may ask the analyst directly.** For the heavy step, a tool like *read the ice* fetches from the analyst over HTTP and draws in one motion, so the pen makes one call instead of two. The analyst is one codebase with two transports: MCP for chat clients, HTTP for the screen.

## 5. Worked example: Sepiola

Sepiola (the bobtail squid, whose skin is a display driven by its brain and whose passing-cloud wave is a spotlight done by an animal) is a single-file page that draws CHIRP's read of a fantasy-hockey week. A lineup is positional, a schedule is a calendar, a back-to-back is two adjacent tiles; the visuals are the argument.

**Meaning is data; only rendering is code.** Four kinds of data carry all meaning: the read contract (`read.schema.json`), the grammar (one array; handlers are pure functions of state), the state (one object; nothing hidden in the DOM), and motion (sequences as timed steps over a fixed verb vocabulary, with end values riding on elements as data attributes). Views are pure functions of state and re-render only what a move touched. The WebMCP registration, the producer console, and the documentation are all derived from the grammar array, so a tool exists in exactly one place.

**The invariant as a test.** Every fixture is rendered through every view in every state, and each text node must be a scalar from the read or a string from the interface copy. A view that composes a sentence or derives a number fails the suite. Layout arithmetic (a value to a bar width) is allowed; a comparison, a sum, or a sort across entities is not. The mockup this was rebuilt from computed start and sit by sorting, projected points by multiplication, and verdict lines by comparison; none of that survived, and the contract grew the fields those views needed.

**Two faces of the analyst.** CHIRP gained a `read_ice` analysis that emits the contract from the NHL's public schedule, club statistics, and rosters, refusing rather than estimating when a source is unavailable and returning unresolved lines as notes rather than dropping them. It is exposed as an MCP tool and as a stateless `POST /read`, first on localhost and then as a Cloudflare Worker with KV-cached NHL data, a cron that warms the cache, a per-address rate limit, and a CORS allowlist naming the page.

**Verification a model can run.** Contract validation with a schema validator; idempotent rendering; the no-opinions test; a console test holding the transcript to exactly what was said; WebMCP descriptor tests; and Playwright scenarios — plain-text scripts of moves — that screenshot every step, drive the real controls, mock the analyst, inject a fake `modelContext`, and, in a separate project, launch Chromium with WebMCP enabled and register against the real API.

## 6. What building it taught

1. **The contract must carry sentences.** A drawable read is not numbers plus a template; it is numbers plus every line the screen will ever show. Otherwise the screen writes them, and it has opinions.
2. **`execute` returns a value, not a content block.** The Community Group draft resolves `execute(input, { signal })` to any JSON-serialisable value and has no `unregisterTool`; registration ends with an abort signal. Secondary sources and the original mockup assumed the MCP content-block shape.
3. **The API hangs off `document`.** Chromium 153 with `--enable-features=WebMCP` exposes `document.modelContext`, nothing on `navigator`, matching an earlier production WebMCP page. The often-quoted `enable-webmcp-testing` flag name does nothing.
4. **Public APIs throttle shared egress.** The NHL's edge answered 429 to a Worker firing ninety-six club requests at once — a failure invisible on a laptop. The fix is never to load on a viewer's clock: pace and retry, warm on a schedule, answer "warming" when cold.
5. **WebKit does not repaint animated SVG masks.** A spotlight built as a mask with an animated hole shipped as a solid grey shade in Safari while fifteen Chromium scenarios passed. Draw holes with a wide-stroked ring under a static clip, and run at least one WebKit pass on any visual mechanism.
6. **Tests must press the buttons.** A refactor removed an import the paste button's handler used; the button died while every scenario stayed green because they called the move through the dispatch API. Scenarios now drive the controls a viewer would.

## 7. Related

**MCP Apps / chat-client UI extensions** render the analyst's graphic *inside* the client; same goal, opposite ownership. **Generative UI** composes the graphic per response; powerful, but regenerated rather than remembered, and bound to one client. **Ordinary WebMCP** makes the page the actor; the telestrator is its complement. **The physical telestrator** — Reiffel's device, Sarnoff's demonstration, sixty years of grammar for pointing at things while explaining them.

## 8. Open questions

Should the screen expose a `state()` tool so a fresh pen can read what the viewer has done since the last stroke? With two pens on one screen, last write wins or named layers as in a broadcast truck? What is the smallest analyst-side contract that makes the pattern work across domains? When WebMCP grows past tools, should the screen publish its state as a resource rather than answer a call? Producer verbs — ready, roll, caption, layer — are designed and deliberately unbuilt until a second analyst exists.

## 9. Availability

Screen: https://sepiola.semanticintent.dev · source https://github.com/semanticintent/sepiola (MIT). Analyst: CHIRP, https://github.com/semanticintent/semantic-chirp-intelligence-mcp (MIT; npm `@semanticintent/semantic-chirp-intelligence-mcp` ≥ 4.3), hosted at https://chirp-mcp.semanticintent.dev, which serves both the stateless `POST /read` the screen draws from and, at `/mcp`, the analyst's full tool set over Streamable HTTP for agents anywhere; the screen never proxies the analyst. The read contract, fixtures, decision log (D1–D37), and scenario scripts are in the Sepiola repository.

## References

1. Web Machine Learning Community Group. *WebMCP.* Draft Community Group Report. https://webmachinelearning.github.io/webmcp/
2. Anthropic. *Model Context Protocol.* https://modelcontextprotocol.io/
3. Shatny, M. (2026). *Semantic Intent as Governance Primitive for Agentic Systems.* https://doi.org/10.5281/zenodo.20436088
4. Shatny, M. (2025). *Semantic Intent as Single Source of Truth: Immutable Governance for AI-Assisted Development.* https://doi.org/10.5281/zenodo.17114972
5. Max Planck Society. *Passing clouds of the cuttlefish.* https://www.mpg.de/8336540/colour-waves-cuttlefish
6. Wikipedia. *Telestrator.* https://en.wikipedia.org/wiki/Telestrator
