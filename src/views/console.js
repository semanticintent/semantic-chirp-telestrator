// The producer's talkback: the transcript of every move made on this screen, by anyone, and the moves available.
// Renders into <div data-view="console">. This view echoes; it is the one view exempt from the no-opinions test (D19).
import { html } from '../html.js';
import { copy } from '../copy.js';
import { grammar } from '../grammar.js';

export const hint = (g) => [g.name, ...g.positional.map((p) => `<${p.replace(/(\[\]|\.\.\.)$/, '')}>`)].join(' ');

export function consoleView(state) {
  const lines = state.log.length
    ? state.log.map((e) => html`<div class="in">&gt; ${e.line}</div><div class="${e.ack.error ? 'err' : 'ok'}">${e.ack.error ? `✗ ${e.ack.error}` : `✓ ${JSON.stringify(e.ack)}`}</div>`)
    : html`<div class="in">${copy.console.ready}</div>`;
  return html`<div class="log" aria-live="polite">${lines}</div>
    <div class="hint">${copy.console.hint} ${grammar.map((g) => html`<code>${hint(g)}</code>`)}</div>`;
}
