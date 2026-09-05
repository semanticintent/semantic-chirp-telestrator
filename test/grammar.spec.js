// The grammar is well-formed, and docs/grammar.md is exactly what it generates.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { grammar } from '../src/grammar.js';
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
    expect(await ri.prepare({ look_ahead_days: 3 }, { source: { mode: 'fixture', fixture: 'cgy-week1' } })).toEqual({ look_ahead_days: 3 });
  });
  it('docs/grammar.md is up to date (npm run docs:grammar)', () => {
    expect(existsSync('docs/grammar.md')).toBe(true);
    expect(readFileSync('docs/grammar.md', 'utf8')).toBe(grammarDoc(grammar));
  });
});
