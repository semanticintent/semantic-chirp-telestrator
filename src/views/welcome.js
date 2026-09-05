// The first thing a visitor sees when nothing is cued: what this is, and three ways in. Static copy only.
import { html } from '../html.js';
import { copy } from '../copy.js';

export function welcome(state) {
  if (state.read) return html``;
  const w = copy.welcome;
  return html`<p class="lead">${w.lead}</p>
    <div class="ways">
      <button class="way" data-sample><b>${w.sample}</b><small>${w.sampleHint}</small></button>
      <button class="way" data-paste><b>${w.paste}</b><small>${w.pasteHint}</small></button>
      <button class="way" data-open-about="quickStart"><b>${w.learn}</b><small>${w.learnHint}</small></button>
    </div>`;
}
