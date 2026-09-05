// The rink window's subtitle. One line, from copy, with the window length from the read.
import { html } from '../html.js';
import { copy, fill } from '../copy.js';

export function chrome(state) {
  if (!state.read) return html`${copy.rink.subEmpty}`;
  return html`${state.ice ? fill(copy.rink.subAfter, { days: state.read.window.days }) : copy.rink.subBefore}`;
}
