// The screen's only line to the analyst. Fixture mode by default; live when an analyst URL is configured with
// ?analyst=<url> or window.TELESTRATOR_ANALYST. Same Read either way, and every live read is checked against the contract
// before a handler sees it. Nothing here imports from CHIRP (D1).
import { fixtures } from './fixtures.js';
import { checkRead } from './contract.js';
import { copy, fill } from './copy.js';

export class AnalystError extends Error {}

export function analystUrl() {
  try {
    const q = new URLSearchParams(globalThis.location?.search ?? '').get('analyst');
    return (q || globalThis.TELESTRATOR_ANALYST || null)?.replace(/\/$/, '') ?? null;
  } catch { return null; }
}
export const mode = () => (analystUrl() ? 'live' : 'fixture');

/** Fetch a Read: from a fixture by name, or from the analyst with the pasted lineup. */
export async function read({ fixture, text, look_ahead_days = 7, opponent_text, start } = {}) {
  if (fixture) {
    const r = fixtures[fixture];
    if (!r) throw new AnalystError(fill(copy.errors.unknownFixture, { name: fixture }));
    return r;
  }
  if (!text) throw new AnalystError(copy.errors.needsRoster);
  const url = analystUrl();
  if (!url) throw new AnalystError(copy.errors.noAnalyst);
  let res;
  try {
    res = await fetch(`${url}/read`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ roster_text: text, look_ahead_days, opponent_text, start }) });
  } catch { throw new AnalystError(fill(copy.errors.analystDown, { url })); }
  if (!res.ok) throw new AnalystError(fill(copy.errors.analystDown, { url }));
  const body = await res.json().catch(() => null);
  const problems = checkRead(body ?? {});
  if (problems.length) throw new AnalystError(fill(copy.errors.badRead, { why: problems[0] }));
  return body;
}
