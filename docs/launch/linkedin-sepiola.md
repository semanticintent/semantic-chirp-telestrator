# LinkedIn launch — Sepiola

*Template B (product launch), one idea per line. Image: `docs/images/sepiola-launch.png` (live site, real read for the week of 12 Oct 2026, both lamps lit). Post the text below as-is.*

---

Every WebMCP demo does the same thing.

The page books the table. Buys the ticket. Submits the form.

The page is the actor.

**The Pain Point:**
The agent already has the intelligence — an MCP server, an API, a model.
What it lacks is a screen.
The read arrives as a paragraph, and it's gone with the next message.

**The real problem isn't what the page can do. It's what the page can show.**

**Sepiola** — a WebMCP telestrator. The page is the screen, not the actor.

Three roles, kept apart:
→ The analyst decides. (CHIRP, an MCP server that reads your fantasy-hockey week from the NHL's public data.)
→ The pen draws. (Any WebMCP agent — or you, at the console.)
→ The screen has no opinions.

That last line isn't a slogan. It's a test.
Every text node on screen must come from the analyst's read or the interface copy.
A view that composes a sentence fails the build.

Seven moves, borrowed from television, not from forms:
├── cue_roster · load the board
├── read_ice · read the ice
├── circle · circle him
├── replay · run it back
├── split · split screen
├── cut_to · cut to
└── wipe · wipe

Paste a lineup. The ice under each skater shows his schedule.
Click a skater — the spotlight opens with the analyst's reason.
Press why — his week runs back: tiles, count, bar, verdict.

**What building it taught me:**
→ Chrome puts WebMCP on document.modelContext, not navigator. The flag everyone quotes does nothing; --enable-features=WebMCP does.
→ The NHL's API answers 429 to a Cloudflare Worker firing 96 requests at once. Never load on a viewer's clock: pace, retry, warm on a cron.
→ Safari won't repaint an animated SVG mask. Fifteen Chromium tests passed while the spotlight shipped grey. Now every visual mechanism gets a WebKit pass.

**Key Points:**
- Registered against Chromium's real WebMCP — 7 tools, not a mock
- Analyst on Cloudflare Workers, screen as one 260 kB file on Pages
- 542 unit tests, 17 browser scenarios, MIT, DOI-archived
- Named for the bobtail squid: a skin that displays what its brain decides

**The analyst decides. The pen draws. The screen has no opinions.**

Try it → sepiola.semanticintent.dev
Source → github.com/semanticintent/sepiola
Paper → doi.org/10.5281/zenodo.22387039
Latest in a series that started with ForageCast.

— Michael Shatny

#SemanticIntent #WebMCP #MCP #AIAgents #FantasyHockey
