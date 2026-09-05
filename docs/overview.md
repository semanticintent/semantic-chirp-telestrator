# CHIRP telestrator — overview

*What we're building, why, and the grammar it speaks now and later.*

Draft 0.1 — September 2026

---

## What we're after

Give CHIRP a screen.

CHIRP already has the analyst's read: schedule edges, games in hand, start/sit calls, stream classification, delivered in a voice with a point of view. Today that read arrives as text inside a chat client. It is correct and it is invisible — the viewer has to rebuild the lineup, the calendar, and the comparison in their head, and it's gone with the next message.

The telestrator gives the read a place to be drawn. A page, styled as a bright warm desktop, with a rink, a panel, and a replay window. An agent — any agent that speaks WebMCP — gets the read from CHIRP and draws it onto the page with a handful of broadcast moves: circle him, run it back, split screen. The page remembers what was drawn. The viewer can reach in and move things. The next question lands on top of what's already there.

The result we want a first-time viewer to feel: *I saw the call before I read it.* Ice quality under the skates, a spotlight on the back-to-back, two weeks side by side with the difference obvious. Then the chirp.

## Why now

- OpenAI's ChatGPT desktop browser and ChatGPT Sites support WebMCP today; Chrome is in origin trial; Claude in Chrome follows once Chrome ships it broadly. A single page reaches all of them.
- Every WebMCP example so far makes the page the actor (book, buy, submit). Making the page the *screen* is unclaimed ground, and fantasy hockey is a domain where the visuals are the argument.
- CHIRP's roster paste mode means no Yahoo approval wait. Anyone can paste a lineup and see it drawn. That's the demo path, and the season starts in October.

## The pieces

```
  CHIRP core            one codebase: analyses, chirp voice, schedule logic
      │
      ├── MCP  ──▶  Claude Desktop, Codex, any MCP client      (the read as text)
      └── HTTP ──▶  the telestrator page                        (the read as a drawing)
                          │
                          └── registers broadcast tools via navigator.modelContext
                                    ▲
                                    │  circle · replay · split · cut_to
                              the agent (pen)
```

Three roles, kept apart. The **analyst** computes and explains, and returns structure, not prose. The **pen** turns the viewer's question into calls and adds the take. The **screen** draws, remembers, and lets the viewer touch. The screen never forms opinions; the pen never reads the graphic aloud.

## The grammar today

The screen speaks seven verbs. Each is one thing an analyst would do with a pen in hand.

| Move | Tool | On screen |
|---|---|---|
| Load the board | `cue_roster(text)` | Resolve a pasted lineup onto the rink |
| Read the ice | `read_ice(look_ahead)` | Fetch the full read; reveal ice quality, badges, the panel, games in hand |
| Circle him | `circle(ids, reason)` | Spotlight one skater with the reason pinned above |
| Run it back | `replay(id)` | Stage the reasoning: tiles flip, count lands, bar fills, call drops |
| Split screen | `split(a, b)` | Two skaters' weeks side by side; who gets the start |
| Cut to | `cut_to(view)` | Bring a window forward: rink, panel, hand, replay, console |
| Wipe | `wipe()` | Clean the screen |

Every tool returns a structured acknowledgment of what it drew, so the pen knows the state it left behind.

Behind the verbs is the **read contract** — the shape CHIRP returns so the screen can draw it. Per skater: games this week as seven bits, back-to-back flag, schedule value 0–100, flag (`warn`, `stream`, `ir`), a one-line reason, projected points per game. Per read: start/sit/stream lists, games in hand for you and the opponent, and an `analysis_id` the pen can hand back to `replay`. Designing this contract is most of the real engineering; the drawing follows from it.

## The grammar going forward

The seven verbs are the **analyst's** moves. A real broadcast has two more layers, and they map cleanly onto where this goes next.

**The producer's moves.** When there is more than one source of intelligence — the opponent scout, the trade analyzer, the draft kit — someone has to decide what's on screen and when. Producer verbs manage the show rather than the drawing:

| Move | Tool | Purpose |
|---|---|---|
| Ready | `ready(view)` | Prepare a window without cutting to it |
| Roll the package | `roll(sequence)` | Play a prepared sequence of moves as one piece |
| Lower third | `caption(text)` | A persistent one-line take under the current view |
| Layer | `layer(name)` | Draw on a named layer so two analysts don't overwrite each other |
| Clear layer | `wipe(layer)` | Wipe one analyst's marks, keep the rest |

**The screen's memory.** Right now the pen only knows what it drew. The viewer may have moved windows, clicked players, cued a new roster. A `state()` tool lets a fresh pen — or a second agent — read the screen before drawing on it. When WebMCP grows past tools into resources, this becomes the screen publishing its state rather than answering a call.

**The truck.** Further out, the pattern generalizes past hockey. Any analyst with structured reads — a database schema intelligence, a temporal context brain — could drive a screen with the same seven verbs and a different rink. The grammar is the reusable part; the rink is the domain.

## Sequence

1. **Read contract.** Add output schemas to CHIRP's analyses so every read is drawable. Ship it on the MCP side too; it makes the text answers better.
2. **HTTP transport.** Expose the same core to the page. Roster paste, no auth.
3. **Wire the page.** Replace mock data with live reads. Keep the producer console; it's the rehearsal room.
4. **Publish.** ChatGPT Sites for the working demo; Chrome origin trial registration so it also runs there.
5. **Producer layer.** Only when a second intelligence source is real. Not before.

## What it is not

- Not a dashboard. Nothing is on screen until someone draws it.
- Not a replacement for the MCP server. Same brain, second face.
- Not a general web standard bet. WebMCP is early; this is built for ChatGPT desktop and Chrome now and lets the rest catch up.
- Not a place for the page to think. If the screen ever has an opinion, something has leaked.

---

*Companion documents: `telestrator-pattern.md` (the pattern), `chirp-telestrator.html` (the reference screen).*
