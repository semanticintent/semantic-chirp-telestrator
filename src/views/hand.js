// Games in hand: your games and the opponent's as two bars, and the analyst's take on the edge.
// With no opponent in the read, one bar and the take. Renders into <div data-view="hand">.
import { html } from '../html.js';
import { copy } from '../copy.js';

const BAR_X = 50, BAR_W = 230, FULL = 50, ROW = 30; // layout only

export function hand(state) {
  const read = state.read;
  if (!read || !state.ice) return html`<p class="empty">${copy.hand.empty}</p>`;
  const g = read.games_in_hand;
  const rows = [['you', g.you], ['opp', g.opp]].filter(([, v]) => v != null);
  return html`<svg class="gih" viewBox="0 0 320 ${rows.length * ROW + 4}" aria-label="Games in hand">
      ${rows.map(([k, v], i) => {
        const y = i * ROW + 3;
        const w = Math.round(Math.min(BAR_W, (v / FULL) * BAR_W));
        return html`<text class="lbl" x="0" y="${y + 14}">${copy.hand[k]}</text>
          <rect class="track" x="${BAR_X}" y="${y}" width="${BAR_W}" height="18" rx="9"/>
          <rect class="fill ${k}" data-seq="gih_bar" data-to-width="${w}" x="${BAR_X}" y="${y}" width="${w}" height="18" rx="9"/>
          <text class="n" data-seq="gih_n" x="320" y="${y + 15}">${v}</text>`;
      })}
    </svg>
    <p class="edge" data-seq="gih_take">${g.take}</p>`;
}
