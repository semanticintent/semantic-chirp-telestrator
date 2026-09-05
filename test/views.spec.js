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
  const [a, b] = read.verdicts.find((v) => v.ids.length === 2)?.ids ?? [read.skaters[0].id, read.skaters[1].id];
  const replayed = findMove('replay').handler(iced, { id: a });
  const split = findMove('split').handler(iced, { a, b });
  const unmatched = findMove('split').handler(iced, { a: read.skaters.at(-1).id, b: read.skaters.at(-2).id });
  return { empty, cued, iced, circled, worded, wiped, replayed, split, unmatched };
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
    it(`replay over ${name} shows the analyst's verdict for a known pair and none for an unknown one`, () => {
      const { split, unmatched, replayed } = states(name, read);
      const pair = read.verdicts.find((v) => v.ids.length === 2);
      if (pair) expect(String(views.replay(split))).toContain(pair.line);
      expect(String(views.replay(unmatched))).not.toContain('verdict-t');
      expect(String(views.replay(replayed)).match(/class="row"/g)).toHaveLength(1);
      expect(String(views.replay(split)).match(/class="row"/g)).toHaveLength(2);
      expect(String(views.replay(states(name, read).wiped))).toBe('');
      expect(String(views.replay(split))).toContain('data-seq="tile"'); // the runner's target, unescaped
    });
  }

  it('every move names only views that exist', () => {
    for (const g of grammar) for (const t of g.touches) expect(views, `${g.name} touches ${t}`).toHaveProperty(t);
  });
});
