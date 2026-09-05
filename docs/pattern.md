# The telestrator

*A WebMCP pattern: the page is the screen the analyst draws on, not the game.*

Draft 0.2 — September 2026

---

## The picture

Intermission. The panel is on. The game is frozen on the big screen and the analyst has the pen. "Watch the weak side here." A circle appears around a defender. "Now run it back." The play rewinds, and this time an arrow shows the lane nobody covered. Then: "Put them side by side" — two clips, split screen, the difference obvious.

Three things are happening at once. The game is the game; the analyst did not play it. The read is the analyst's; the screen did not think of it. And the telestrator is where the read gets drawn onto the game so that everyone watching sees what the analyst sees.

That is the pattern. An agent has intelligence from somewhere. A page gives it a screen and a pen.

## In one sentence

A web page exposes tools that **show** rather than **do**, so an agent whose intelligence lives elsewhere can draw that intelligence onto a persistent surface the human is also looking at.

## Context

WebMCP lets a page register callable tools that an in-browser agent can discover and invoke. Almost every example so far uses those tools the way a site's own buttons are used: book the table, complete the checkout, submit the form. The page performs the task; the agent is a hands-free operator of it. The site is the actor.

That assumes the page owns the capability. Increasingly it doesn't. The capability is an MCP server, an API, a model, a library the agent already has. What the agent lacks is a way to *present* the result that outlives a chat turn and that the human can touch.

## Problem

Chat is a poor broadcast. Intelligence with shape — a lineup with positions, a schedule with gaps, three options with trade-offs — arrives as a paragraph the viewer must rebuild in their head. A one-off chart is gone with the next message. UI rendered inside the chat client belongs to that client and is invisible to any other agent, or to a person opening the page on their own.

The analyst is talking with no screen behind them.

## Forces

- **Persistence.** What was drawn must still be there when the next question is asked.
- **Portability.** The same screen should serve any agent, and still work with no agent at all.
- **Legibility.** The agent's actions should be visible *as* actions — a circle appearing, a replay running — not inferred from a changed page.
- **Trust.** A call without the reasoning is hard to act on; reasoning without form is hard to follow.
- **Authority.** The intelligence stays the analyst. The screen must not grow its own opinions.

## Solution

Three roles, kept apart.

```
   the analyst                 the pen                     the screen
   (MCP server / API)          (any WebMCP agent)          (the page)
         │                        │                           │
         │  "what's the read?"    │                           │
         │◀───────────────────────│                           │
         │  structured read       │                           │
         │───────────────────────▶│  circle · replay · split  │
         │                        │──────────────────────────▶│
         │                        │                           │  draws, remembers
         │                        │                     viewer watches, touches
```

**The screen registers a small broadcast vocabulary.** Not `book`, `submit`, `checkout` — but `circle`, `replay`, `split`, `cut_to`, `wipe`. Each one changes what is visible and returns a structured acknowledgment of what it drew.

**The screen remembers.** Windows stay where they were left; a circle stays until wiped; the last panel is still up when the next question comes. The viewer can reach in and move things. The pen's next stroke lands on whatever is there.

**The analyst returns structure, not prose.** Every intelligence tool carries an output schema the screen can draw from: per-entity scores, flags, one-line reasons, and an `analysis_id` the pen can hand back to `replay`.

**Run it back is a first-class move.** Because the analyst returned the steps and the screen has a tool that stages them, reasoning is something the viewer *watches* — tiles flip, a count lands, a bar fills, the call drops — rather than something they are told.

**The screen may ask the analyst directly.** For the heavy step, a tool like `read_ice` fetches from the intelligence over HTTP and draws in one motion, so the pen makes one call instead of two. The analyst is one codebase with two transports: MCP for chat clients, HTTP for the screen.

## Participants

| Role | Responsibility | Never |
|---|---|---|
| Analyst (intelligence) | Compute, decide, explain; return structured reads with ids | Draw, hold screen state |
| Pen (agent) | Turn the viewer's question into analyst calls and screen calls; add the take | Read the graphic aloud |
| Screen (canvas page) | Register the broadcast verbs; draw; remember; let the viewer touch | Grow its own analysis; hide what the pen did |
| Viewer (human) | Ask, watch, touch, redirect | — |

## The broadcast grammar

Television has spent decades building a vocabulary for showing reasoning. Borrow it.

| Broadcast move | Tool | What it means on the screen |
|---|---|---|
| Load the board | `cue_roster(text)` | Give the screen its subject |
| Read the ice | `read_ice(look_ahead)` | Fetch the full read and draw it |
| Circle him | `circle(ids, reason)` | Point at one thing and say why |
| Run it back | `replay(id)` | Stage the reasoning behind one call |
| Split screen | `split(a, b)` | Two options, side by side, the difference visible |
| Cut to | `cut_to(view)` | Bring a window forward |
| Wipe | `wipe()` | Clean the screen |

Every verb is one sentence the pen can say visually. That is the test for adding a new one: if an analyst wouldn't do it with a telestrator, it belongs on the analyst's side, not the screen's.

**The rule of the panel:** the graphic carries the numbers; the analyst carries the take. An agent that re-describes what the screen just drew is a broadcaster reading the scoreboard aloud. The pen circles, then chirps.

## Consequences

**Gains**

- One persistent, touchable screen shared by the viewer and the pen.
- The same screen serves any agent that speaks WebMCP, and a producer console can drive it with no agent at all.
- The pen's moves are visible as motion, so they are legible and reviewable.
- Reasoning becomes a replay, not a recital.
- The analyst stays portable; the screen is one of its faces.

**Costs**

- The output schema is now an interface between two systems, and changes ripple.
- Routing the heavy step through the pen adds latency and reasoning cost; let the screen call the analyst directly for that step.
- A screen that starts forming opinions becomes a second analyst. Guard the boundary.
- WebMCP availability is uneven in 2026. This is demo- and early-adopter-ready, not a broad production dependency yet.

## When not to use it

- The read has no shape. A forecast or a definition does not need a screen.
- The page really is the actor. If the job is to book or buy, use WebMCP the ordinary way.
- Nobody will look twice. Disposable answers belong in chat.

## Worked example: Sepiola, the CHIRP telestrator

Fantasy hockey is a natural host because the visuals *are* the argument. A lineup is positional. A schedule is a calendar. A back-to-back is two adjacent tiles. Draw CHIRP's schedule intelligence as ice quality under each skater's feet and the whole read is visible before the analyst says a word.

The screen is a single HTML page styled as a warm desktop: a rink window with the lineup in formation, the panel (start / sit / IR / stream calls, with a why on each), a games-in-hand window, a replay window that runs reasoning back as a broadcast sequence, and a producer console that speaks the same grammar the agent would. The page registers `read_ice`, `circle`, `replay`, `split`, `cut_to` and `cue_roster` with `navigator.modelContext` when the API exists, and falls back to the console when it doesn't.

`read_ice` reveals the ice and puts up the panel. `circle("zary", "2 games, back-to-back")` sweeps a spotlight onto one skater with the reason pinned above him. `split("gridin", "zary")` runs both weeks back side by side — calendar tiles flip on game days, the counts land, the projected-points bars fill, and the call drops: *Gridin skates two more. Start him.* The viewer can drag windows, click players, and ask the next question with everything still on screen.

## Related

- **MCP Apps / chat-client UI extensions** — the analyst renders its own graphic *inside* the chat client. Same goal, opposite ownership: the screen belongs to the client, not to a page the viewer can open alone.
- **Generative UI** — the model composes the graphic per response. Powerful, but regenerated rather than remembered, and bound to one client.
- **Ordinary WebMCP** — the page is the actor. The telestrator is its complement: the page is the screen.
- **The real telestrator** — Sarnoff's device, 1950s, drawn onto live television. Sixty years of grammar for pointing at things while explaining them.

## Open questions

- Should the screen expose a `state()` tool so a fresh pen can read what the viewer has done since the last stroke?
- Two pens, one screen: last write wins, or named layers like a real broadcast truck?
- What is the smallest output schema on the analyst's side that makes the pattern work across domains?
- When WebMCP grows past tools, should the screen register its current state as a *resource*?

---

*Reference implementation: Sepiola (this repository). Analyst: semantic-chirp-intelligence-mcp.*
