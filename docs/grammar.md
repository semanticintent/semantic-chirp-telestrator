# The grammar

*Generated from `src/grammar.js` by `npm run docs:grammar`. Do not edit; a test fails if this file drifts.*

Every move is one thing an analyst would do with a pen in hand. Each returns a structured ack of what it drew.

| Move | Tool | Input | Touches | Sequence | On screen |
|---|---|---|---|---|---|
| Load the board | `cue_roster` | `text: string?`, `fixture: string?` | chrome, rink, spot, strips, panel, hand | — | Load a roster onto the rink. Give `text`, the pasted lineup (any format, one player per line), when an analyst is configured; or `fixture`, the name of a read in fixtures/. |
| Read the ice | `read_ice` | `look_ahead_days: number?`, `start: string?` | chrome, rink, strips, panel, hand | `read_ice` | Reveal the read: ice quality under the skates, badges, the calls, games in hand. `start` (YYYY-MM-DD) moves the window; the analyst defaults to today. |
| Circle him | `circle` | `ids: id[]`, `reason: string?` | spot | `circle` | Spotlight one skater with the reason pinned above. Without a reason, the analyst's own line is used. |
| Run it back | `replay` | `id: id` | replay | `replay` | Stage the reasoning behind one skater: his week, the analyst's line, his projected points, and the call if the analyst made one. |
| Split screen | `split` | `a: id`, `b: id` | replay | `replay` | Two skaters' weeks side by side, then the analyst's call on who gets the start, if the analyst made one. |
| Cut to | `cut_to` | `view: view` |  | — | Bring a window forward: rink, panel, hand, replay, or console. |
| Wipe | `wipe` | — | chrome, rink, spot, strips, replay, panel, hand | `wipe` | Clean the screen. The roster stays cued; the read, the circle, and the replay are cleared. |

7 moves. Producer verbs (`ready`, `roll`, `caption`, `layer`) are designed but not built.
