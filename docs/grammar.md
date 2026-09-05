# The grammar

*Generated from `src/grammar.js` by `npm run docs:grammar`. Do not edit; a test fails if this file drifts.*

Every move is one thing an analyst would do with a pen in hand. Each returns a structured ack of what it drew.

| Move | Tool | Input | Touches | Sequence | On screen |
|---|---|---|---|---|---|
| Load the board | `cue_roster` | `fixture: string` | chrome, rink, spot, strips | — | Load a roster onto the rink. Fixture mode takes a fixture name; live mode will take the pasted lineup. |
| Read the ice | `read_ice` | `look_ahead_days: number?` | chrome, rink, strips, panel, hand | `read_ice` | Reveal the read: ice quality under the skates, badges, the calls, games in hand. |
| Circle him | `circle` | `ids: id[]`, `reason: string?` | spot | `circle` | Spotlight one skater with the reason pinned above. Without a reason, the analyst's own line is used. |
| Run it back | `replay` | `id: id` | replay | `replay` | Stage the reasoning behind one skater: his week, the analyst's line, his projected points, and the call if the analyst made one. |
| Split screen | `split` | `a: id`, `b: id` | replay | `replay` | Two skaters' weeks side by side, then the analyst's call on who gets the start, if the analyst made one. |
| Cut to | `cut_to` | `view: string` |  | — | Bring a window forward: rink, panel, hand, replay, or console. |
| Wipe | `wipe` | — | chrome, rink, spot, strips, replay, panel, hand | `wipe` | Clean the screen. The roster stays cued; the read, the circle, and the replay are cleared. |

7 moves. Producer verbs (`ready`, `roll`, `caption`, `layer`) are designed but not built.
