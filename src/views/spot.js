// The spotlight: a shade over the ice with a hole over one skater, and the reason pinned above.
// Renders into <g data-view="spot">. Empty when nothing is circled. End values ride on the elements for the runner (D8).
//
// The shade is one circle with an enormous stroke: everything from the hole's edge outward is covered, the hole is the
// unstroked middle, and the ice's rounded outline clips it (a static clipPath in the shell). No <mask>: WebKit does not
// repaint changes inside a mask, so an animated mask hole never opened in Safari. hole = r - RING.
import { html } from '../html.js';
import { skater } from '../state.js';
import { place } from '../layout.js';

const CHAR = 7.6; // approximate advance of the callout face at 15px; layout only
const HOLE = 95;  // spotlight radius
const RING = 1500; // half the stroke: r = HOLE + RING leaves a hole of HOLE

export function spot(state) {
  const c = state.circle;
  const s = c && skater(state, c.id);
  const p = s && place(state.read).get(s.id);
  if (!p) return html``;
  const text = c.reason ?? s.reason;
  const w = Math.round(text.length * CHAR + 28);
  const cx = Math.min(1000 - w - 10, Math.max(10, p.x - w / 2));
  const cy = p.y - 86;
  return html`<circle class="shade" data-seq="shade hole" cx="${p.x}" cy="${p.y + 8}" r="${HOLE + RING}" data-from-r="${RING}" data-to-r="${HOLE + RING}" data-hole="${HOLE}"
      stroke-width="${RING * 2}" clip-path="url(#ice-clip)" pointer-events="none"/>
    <g class="callout" data-seq="callout" transform="translate(${cx} ${cy})" pointer-events="none">
      <rect width="${w}" height="28" rx="8"/><text x="14" y="19">${text}</text>
    </g>`;
}
