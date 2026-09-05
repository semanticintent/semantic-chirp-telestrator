// The lineup in formation, with the ice under each skater's feet. Renders into <g data-view="rink"> inside the rink SVG.
// Everything drawn is a value from the read laid out in space. Ice quality is schedule_value; game days are the games bits;
// the back-to-back tag is the b2b bit; badges are the flag. Nothing is counted, compared, or summed here.
import { html } from '../html.js';
import { copy } from '../copy.js';
import { place } from '../layout.js';

const JERSEY = 'M-22,-16 l 7,-8 h 30 l 7,8 v 30 q 0,6 -6,6 h -32 q -6,0 -6,-6 z';
const STRIPE = 'M-8,-24 h 16 v 5 h -16 z';

export function rink(state) {
  const read = state.read;
  if (!read) return html``;
  const spots = place(read);
  const shown = state.ice ? 1 : 0;
  const onIce = read.skaters.filter((s) => spots.has(s.id));

  const patches = onIce.map((s) => {
    const { x, y } = spots.get(s.id);
    const v = s.schedule_value / 100;
    return html`<g class="patch" data-seq="patch" data-id="${s.id}" transform="translate(${x} ${y + 26})" opacity="${shown}">
      <ellipse rx="52" ry="20" fill="url(#chewed)" opacity="${(1 - v).toFixed(2)}"/>
      <ellipse rx="56" ry="22" fill="url(#gloss)" opacity="${v.toFixed(2)}"/>
    </g>`;
  });

  const jerseys = onIce.map((s) => {
    const { x, y } = spots.get(s.id);
    const club = s.club ?? 'none';
    const x0 = -((read.window.days - 1) * 8) / 2;
    return html`<g class="jersey" data-id="${s.id}" transform="translate(${x} ${y})" tabindex="0" role="button" aria-label="${s.name} ${s.pos}"
        style="--c1:var(--club-${club}-1, var(--club-none-1));--c2:var(--club-${club}-2, var(--club-none-2))">
      <path class="body" d="${JERSEY}"/>
      <path class="stripe" d="${STRIPE}"/>
      <text class="num" y="9">${s.num ?? ''}</text>
      <text class="nm" y="38">${s.name}</text>
      <g class="days" data-seq="days" transform="translate(${x0} 50)" opacity="${shown}">
        ${read.window.labels.map((label, i) => html`<circle class="day${s.games[i] ? ' game' : ''}" cx="${i * 8}" r="2.6"><title>${label}</title></circle>`)}
        ${s.b2b ? html`<text class="b2b" x="${-x0 + 10}" y="3.5">${copy.glyph.b2b}</text>` : ''}
      </g>
      ${s.flag && s.flag !== 'ir' ? html`<g class="badge-g ${s.flag}" data-seq="badge" transform="translate(24 -18)" opacity="${shown}">
        <circle r="9"/><text class="badge">${copy.glyph[s.flag]}</text>
      </g>` : ''}
    </g>`;
  });

  return html`<g class="patches">${patches}</g><g class="players">${jerseys}</g>`;
}
