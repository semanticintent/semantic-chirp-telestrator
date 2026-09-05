// The spotlight: a shade over the ice with a hole cut over one skater, and the reason pinned above.
// Renders into <g data-view="spot">. Empty when nothing is circled. End values ride on the elements for the runner (D8).
import { html } from '../html.js';
import { skater } from '../state.js';
import { place } from '../layout.js';

const CHAR = 7.6; // approximate advance of the callout face at 15px; layout only

export function spot(state) {
  const c = state.circle;
  const s = c && skater(state, c.id);
  const p = s && place(state.read).get(s.id);
  if (!p) return html``;
  const text = c.reason ?? s.reason;
  const w = Math.round(text.length * CHAR + 28);
  const cx = Math.min(1000 - w - 10, Math.max(10, p.x - w / 2));
  const cy = p.y - 86;
  return html`<mask id="spot-mask"><rect width="1000" height="470" fill="#fff"/><circle data-seq="hole" cx="${p.x}" cy="${p.y + 8}" r="95" fill="#000"/></mask>
    <rect class="shade" data-seq="shade" width="1000" height="470" rx="130" mask="url(#spot-mask)" pointer-events="none"/>
    <g class="callout" data-seq="callout" transform="translate(${cx} ${cy})" pointer-events="none">
      <rect width="${w}" height="28" rx="8"/><text x="14" y="19">${text}</text>
    </g>`;
}
