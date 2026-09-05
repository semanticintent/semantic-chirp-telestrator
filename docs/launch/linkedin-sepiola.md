# LinkedIn launch draft — Sepiola

*Template B (product launch). One idea per line. Post the text; add the screenshot `docs/images/telestrator-live.png` as the image. The "Nth in a series" line needs the real count.*

---

Every WebMCP demo so far does the same thing.

The page books the table. Buys the ticket. Submits the form.

The page is the actor.

**The Pain Point:**
An agent already has the intelligence — an MCP server, an API, a model.
What it lacks is a screen. The read arrives as a paragraph, and it's gone with the next message.

**The real problem isn't what the page can do. It's what the page can show.**

**Sepiola** — a WebMCP telestrator. The page is the screen, not the actor.

Three roles, kept apart:
→ The analyst decides. (CHIRP, an MCP server that reads your fantasy-hockey week.)
→ The pen draws. (Any WebMCP agent — or you, at the console.)
→ The screen has no opinions.

That last line isn't a slogan. It's a test: every text node on screen must come from the analyst's read or the interface copy. A view that composes a sentence fails the build.

Seven moves, borrowed from television, not from forms:
├── cue_roster · load the board
├── read_ice · read the ice
├── circle · circle him
├── replay · run it back
├── split · split screen
├── cut_to · cut to
└── wipe · wipe

Paste a lineup. The ice under each skater shows his schedule. Click a skater and the spotlight opens with the analyst's reason. Press why and his week runs back as tiles, count, bar, verdict.

**Key Points:**
- Registered against Chromium's real WebMCP (`document.modelContext`), not a mock
- The analyst runs on Cloudflare Workers; the screen is one 260 kB file on Pages
- 542 unit tests, 17 browser scenarios, MIT
- Named for the bobtail squid — a skin that displays what its brain decides

**The analyst decides. The pen draws. The screen has no opinions.**

Try it → sepiola.semanticintent.dev
Source → github.com/semanticintent/sepiola
Paper → doi.org/10.5281/zenodo.22387039
Nth in a series. (First: ForageCast.)

— Michael Shatny

#SemanticIntent #WebMCP #MCP #FantasyHockey
