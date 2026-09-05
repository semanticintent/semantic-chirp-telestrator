// Every view renders every fixture in every state without throwing, and renders the same state to the same markup.
import { describe, it, expect } from 'vitest';
import { views } from '../src/views/index.js';
import { fixtures } from '../src/fixtures.js';
import { initialState } from '../src/state.js';
import { grammar, findMove } from '../src/grammar.js';

const onIce = (read) => read.skaters.find((s) => !['BN', 'IR'].includes(s.slot));

export function states(name, read) {
  const empty = initialState();
  const cued = findMove('cue_roster').handler(empty, { fixture: name });
  const iced = findMove('read_ice').handler(cued, {});
  const circled = findMove('circle').handler(iced, { ids: [onIce(read).id] });
  const worded = findMove('circle').handler(iced, { ids: [onIce(read).id], reason: 'the pen said so' });
  const wiped = findMove('wipe').handler(circled, {});
  return { empty, cued, iced, circled, worded, wiped };
}

describe('views', () => {
  for (const [name, read] of Object.entries(fixtures)) {
    for (const [label, state] of Object.entries(states(name, read))) {
      for (const [view, fn] of Object.entries(views)) {
        it(`${view} renders ${name} when ${label}, idempotently`, () => {
          const a = String(fn(state));
          const b = String(fn(state));
          expect(a).toBe(b);
        });
      }
    }
    it(`spot shows the pen's reason over ${name} when given one`, () => {
      const { worded, circled } = states(name, read);
      expect(String(views.spot(worded))).toContain('the pen said so');
      expect(String(views.spot(circled))).toContain(onIce(read).reason);
    });
    it(`spot is empty over ${name} after a wipe`, () => {
      expect(String(views.spot(states(name, read).wiped))).toBe('');
    });
  }

  it('every move names only views that exist', () => {
    for (const g of grammar) for (const t of g.touches) expect(views, `${g.name} touches ${t}`).toHaveProperty(t);
  });
});
