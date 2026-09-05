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
  it('docs/grammar.md is up to date (npm run docs:grammar)', () => {
    expect(existsSync('docs/grammar.md')).toBe(true);
    expect(readFileSync('docs/grammar.md', 'utf8')).toBe(grammarDoc(grammar));
  });
});
