// WebMCP registration is derived from the grammar and matches the draft spec's descriptor shape.
import { describe, it, expect, vi } from 'vitest';
import { grammar } from '../src/grammar.js';
import { descriptors, inputSchema, register } from '../src/webmcp.js';
import { WINDOWS } from '../src/state.js';

describe('webmcp descriptors', () => {
  const ds = descriptors();
  it('registers exactly the grammar, nothing more', () => {
    expect(ds.map((d) => d.name)).toEqual(grammar.map((g) => g.name));
  });
  for (const d of ds) {
    it(`${d.name} is a well-formed ModelContextTool`, () => {
      expect(d.name).toMatch(/^[A-Za-z0-9_.-]{1,128}$/); // spec: name charset and length
      expect(d.title).toBeTruthy();
      expect(d.description.length).toBeGreaterThan(10);
      expect(typeof d.execute).toBe('function');
      expect(d.inputSchema.type).toBe('object');
      for (const r of d.inputSchema.required) expect(Object.keys(d.inputSchema.properties)).toContain(r);
      expect(d.annotations).toEqual({ readOnlyHint: false, consequentialHint: false });
    });
  }
  it('makes optional inputs optional and typed inputs typed', () => {
    const cue = inputSchema(grammar.find((g) => g.name === 'cue_roster'));
    expect(cue.required).toEqual([]);
    expect(Object.keys(cue.properties).sort()).toEqual(['fixture', 'opponent_text', 'text']);
    const circle = inputSchema(grammar.find((g) => g.name === 'circle'));
    expect(circle.required).toEqual(['ids']);
    expect(circle.properties.ids.type).toBe('array');
    const cut = inputSchema(grammar.find((g) => g.name === 'cut_to'));
    expect(cut.properties.view.enum).toEqual(WINDOWS);
  });
});

describe('register', () => {
  it('reports unavailable when the browser has no modelContext', async () => {
    expect(await register(null)).toEqual({ available: false, registered: 0 });
    expect(await register({})).toEqual({ available: false, registered: 0 });
  });
  it('registers every descriptor with a modelContext', async () => {
    const mc = { registerTool: vi.fn(async () => undefined) };
    const r = await register(mc);
    expect(r).toEqual({ available: true, registered: grammar.length });
    expect(mc.registerTool.mock.calls.map(([d]) => d.name)).toEqual(grammar.map((g) => g.name));
  });
  it('keeps going when one registration is refused', async () => {
    const mc = { registerTool: vi.fn(async (d) => { if (d.name === 'wipe') throw new Error('nope'); }) };
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(await register(mc)).toEqual({ available: true, registered: grammar.length - 1 });
  });
});
