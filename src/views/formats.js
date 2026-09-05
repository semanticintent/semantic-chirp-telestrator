// The accepted paste formats, one real example each, and a button that fills the box with the sample lineup. Static copy.
import { html } from '../html.js';
import { copy } from '../copy.js';

export function formats() {
  const f = copy.paste;
  return html`<p>${f.lead}</p>
    <table class="formats-table">${f.examples.map(([what, ex]) => html`<tr><td>${what}</td><td><code>${ex}</code></td></tr>`)}</table>
    <button type="button" class="paste-sample" data-paste-sample>${f.useSample}</button>`;
}
