// WebMCP registration, derived from the grammar. One adapter, against the W3C Community Group draft (checked 2026-09-04):
// registerTool({ name, title, description, inputSchema, execute, annotations }) returning a Promise; execute(input, { signal })
// Verified 2026-09-05 against Chromium 153 with --enable-features=WebMCP: all seven descriptors accepted (test/webmcp-real.spec.js).
// resolves to any JSON-serializable value, so the ack goes back as-is. No unregisterTool; an AbortSignal does that.
import { grammar } from './grammar.js';
import { call } from './dispatch.js';
import { WINDOWS } from './state.js';

const TYPES = {
  string: { type: 'string' },
  number: { type: 'number' },
  id: { type: 'string', description: 'A skater id from the read.' },
  'id[]': { type: 'array', items: { type: 'string' }, minItems: 1, description: 'Skater ids from the read.' },
  view: { type: 'string', enum: WINDOWS },
};

export function inputSchema(move) {
  const properties = {}; const required = [];
  for (const [key, spec] of Object.entries(move.input)) {
    const optional = spec.endsWith('?');
    properties[key] = { ...TYPES[spec.replace(/\?$/, '')] };
    if (!optional) required.push(key);
  }
  return { type: 'object', properties, required, additionalProperties: false };
}

export const descriptors = () => grammar.map((g) => ({
  name: g.name,
  title: g.move,
  description: g.description,
  inputSchema: inputSchema(g),
  annotations: { readOnlyHint: false, consequentialHint: false },
  execute: (input) => call(g.name, input ?? {}, `agent ${g.name} ${JSON.stringify(input ?? {})}`),
}));

/** Chrome (153, --enable-features=WebMCP) and Orbweaver's host both attach it to document; navigator is the fallback. */
export function modelContext() {
  return globalThis.document?.modelContext ?? globalThis.navigator?.modelContext ?? null;
}

/** Register every move. Returns what happened so the menubar can say so. */
export async function register(mc = modelContext()) {
  if (!mc || typeof mc.registerTool !== 'function') return { available: false, registered: 0 };
  let registered = 0;
  for (const d of descriptors()) {
    try { await mc.registerTool(d); registered++; } catch (e) { console.warn('webmcp: could not register', d.name, e); }
  }
  return { available: true, registered };
}
