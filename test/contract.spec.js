// Every fixture validates against the read contract, and the cross-field rules Ajv cannot express hold too.
import { describe, it, expect } from 'vitest';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import schema from '../contracts/read.schema.json';
import { fixtures } from '../src/fixtures.js';

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);

describe('read contract', () => {
  it('has fixtures to check', () => expect(Object.keys(fixtures).length).toBeGreaterThan(1));

  for (const [name, read] of Object.entries(fixtures)) {
    describe(name, () => {
      it('validates against contracts/read.schema.json', () => {
        const ok = validate(read);
        expect(ok, JSON.stringify(validate.errors, null, 2)).toBe(true);
      });
      it('has one game bit and one label per day', () => {
        expect(read.window.labels).toHaveLength(read.window.days);
        for (const s of read.skaters) expect(s.games, s.id).toHaveLength(read.window.days);
      });
      it('only refers to skaters it contains', () => {
        const ids = new Set(read.skaters.map((s) => s.id));
        for (const list of Object.values(read.calls)) for (const id of list) expect(ids.has(id), id).toBe(true);
        for (const v of read.verdicts) for (const id of v.ids) expect(ids.has(id), id).toBe(true);
      });
    });
  }
});
