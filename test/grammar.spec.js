// The grammar is well-formed, and docs/grammar.md is exactly what it generates.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { grammar } from '../src/grammar.js';
import { initialState } from '../src/state.js';
import { fixtures } from '../src/fixtures.js';
import { grammarDoc } from '../src/grammar-doc.js';
import { sequences } from '../src/motion/runner.js';

const ANALYSIS = /^(rank|score|recommend|project|decide|compare|evaluate|analy[sz]e)/i;

describe('grammar', () => {
  for (const g of grammar) {
    it(`${g.name} is a complete move`, () => {
      for (const k of ['name', 'move', 'description', 'input', 'positional', 'touches', 'handler', 'ack']) expect(g, k).toHaveProperty(k);
      for (const p of g.positional) expect(Object.keys(g.input), `${g.name} positional ${p}`).toContain(p.replace(/(\[\]|\.\.\.)$/, ''));
      if (g.sequence) expect(sequences, `${g.name} sequence ${g.sequence}`).toHaveProperty(g.sequence);
      expect(g.name, 'no analysis verbs on the screen').not.toMatch(ANALYSIS);
    });
  }
  it('cue_roster.prepare fetches a fixture by name and refuses an unknown one', async () => {
    const cue = grammar.find((g) => g.name === 'cue_roster');
    const input = await cue.prepare({ fixture: 'cgy-week1' });
    expect(input.read.analysis_id).toBe('fx-cgy-week1');
    await expect(cue.prepare({ fixture: 'nope' })).rejects.toThrow(/No fixture called "nope"/);
    await expect(cue.prepare({})).rejects.toThrow(/fixture name, or a pasted lineup/);
    await expect(cue.prepare({ text: 'Zary LW' })).rejects.toThrow(/No analyst is configured/);
  });
  it('read_ice.prepare leaves a fixture-sourced state alone', async () => {
    const ri = grammar.find((g) => g.name === 'read_ice');
    expect(await ri.prepare({ look_ahead_days: 3, start: '2026-10-05' }, { source: { mode: 'fixture', fixture: 'cgy-week1' } })).toEqual({ look_ahead_days: 3, start: '2026-10-05' });
  });
  it('analystUrl: ?analyst= wins, fixtures forces fixture mode, nothing configured means fixtures', async () => {
    const { analystUrl } = await import('../src/analyst.js');
    globalThis.location = { search: '?analyst=http://a.test/' };
    expect(analystUrl()).toBe('http://a.test');
    globalThis.location = { search: '?analyst=fixtures' };
    globalThis.SEPIOLA_ANALYST = 'http://b.test';
    expect(analystUrl()).toBeNull();
    globalThis.location = { search: '' };
    expect(analystUrl()).toBe('http://b.test');
    delete globalThis.SEPIOLA_ANALYST;
    expect(analystUrl()).toBeNull(); // tests run without a build default
    delete globalThis.location;
  });
  it('parseLine: a date where days were expected slides to start; nonsense is refused with the example', async () => {
    const { parseLine } = await import('../src/dispatch.js');
    expect(parseLine('read_ice 2026-10-05')).toEqual({ name: 'read_ice', input: { start: '2026-10-05' } });
    expect(parseLine('read_ice 7 2026-10-05')).toEqual({ name: 'read_ice', input: { look_ahead_days: 7, start: '2026-10-05' } });
    expect(parseLine('read_ice 3')).toEqual({ name: 'read_ice', input: { look_ahead_days: 3 } });
    const bad = parseLine('read_ice seven');
    expect(bad.error).toBe('Expected a number for look_ahead_days. Try: read_ice 7 2026-10-05');
    expect(parseLine('circle zary 2 games, back-to-back')).toEqual({ name: 'circle', input: { ids: ['zary'], reason: '2 games, back-to-back' } });
  });
  it('read_ice refuses a window length that is not 1–14 whole days', () => {
    const ri = grammar.find((g) => g.name === 'read_ice');
    const cued = grammar.find((g) => g.name === 'cue_roster').handler(initialState(), { fixture: 'cgy-week1', read: fixtures['cgy-week1'] });
    expect(() => ri.handler(cued, { look_ahead_days: 0 })).toThrow(/1 to 14/);
    expect(() => ri.handler(cued, { look_ahead_days: 2.5 })).toThrow(/whole number/);
    expect(ri.handler(cued, { look_ahead_days: 7 }).ice).toBe(true);
  });
  it('a new read touches every view that shows read data', () => {
    const ri = grammar.find((g) => g.name === 'read_ice');
    for (const v of ['rink', 'spot', 'panel', 'hand', 'replay', 'strips']) expect(ri.touches).toContain(v);
  });
  it('docs/grammar.md is up to date (npm run docs:grammar)', () => {
    expect(existsSync('docs/grammar.md')).toBe(true);
    expect(readFileSync('docs/grammar.md', 'utf8')).toBe(grammarDoc(grammar));
  });
});
