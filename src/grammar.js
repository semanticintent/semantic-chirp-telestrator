// The only place a tool is defined. WebMCP registration, the console, the scenario runner, and docs/grammar.md derive from this array.
// Handlers are pure: (state, input) → state. They never touch the DOM. They throw MoveError with a line from copy when a move cannot be made.
import { fixtures } from './fixtures.js';
import { open, skater } from './state.js';
import { copy, fill } from './copy.js';

export class MoveError extends Error {}
const refuse = (template, vars = {}) => { throw new MoveError(fill(template, vars)); };

export const grammar = [
  {
    name: 'cue_roster',
    move: 'Load the board',
    description: 'Load a roster onto the rink. Fixture mode takes a fixture name; live mode will take the pasted lineup.',
    input: { fixture: 'string' },
    positional: ['fixture'],
    touches: ['chrome', 'rink', 'spot', 'strips'],
    sequence: null,
    handler(state, { fixture }) {
      const read = fixtures[fixture];
      if (!read) refuse(copy.errors.unknownFixture, { name: fixture });
      return open({ ...state, read, ice: false, circle: null, replay: null }, 'rink');
    },
    ack: (s) => ({ cued: s.read.analysis_id, skaters: s.read.skaters.length }),
  },
  {
    name: 'read_ice',
    move: 'Read the ice',
    description: 'Reveal the read: ice quality under the skates, badges, the calls, games in hand.',
    input: { look_ahead_days: 'number?' },
    positional: ['look_ahead_days'],
    touches: ['chrome', 'rink', 'strips'],
    sequence: 'read_ice',
    handler(state) {
      if (!state.read) refuse(copy.errors.noRoster);
      return open({ ...state, ice: true }, 'rink');
    },
    ack: (s) => ({
      read: s.read.analysis_id,
      calls: s.read.calls,
      games_in_hand: { you: s.read.games_in_hand.you, opp: s.read.games_in_hand.opp },
    }),
  },
  {
    name: 'circle',
    move: 'Circle him',
    description: 'Spotlight one skater with the reason pinned above. Without a reason, the analyst\'s own line is used.',
    input: { ids: 'string[]', reason: 'string?' },
    positional: ['ids[]', 'reason...'],
    touches: ['spot'],
    sequence: 'circle',
    handler(state, { ids, reason }) {
      const id = (Array.isArray(ids) ? ids : [ids])[0];
      const s = skater(state, id);
      if (!s || s.slot === 'BN' || s.slot === 'IR') refuse(copy.errors.unknownSkater, { id });
      return open({ ...state, circle: { id, reason: reason || null } }, 'rink');
    },
    ack: (s) => ({ circled: s.circle.id, reason: s.circle.reason ?? skater(s, s.circle.id).reason }),
  },
  {
    name: 'wipe',
    move: 'Wipe',
    description: 'Clean the screen. The roster stays cued; the read, the circle, and the replay are cleared.',
    input: {},
    positional: [],
    touches: ['chrome', 'rink', 'spot', 'strips'],
    sequence: 'wipe',
    handler(state) {
      return { ...state, ice: false, circle: null, replay: null };
    },
    ack: () => ({ cleared: true }),
  },
];

export const findMove = (name) => grammar.find((g) => g.name === name);
