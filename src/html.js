// A ten-line tagged template. Interpolations are escaped unless they are markup made by html`` itself (or raw()).
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ESC[c]);

class Markup { constructor(s) { this.s = s; } toString() { return this.s; } }
export const raw = (s) => new Markup(String(s));

const part = (v) => v == null || v === false ? '' : v instanceof Markup ? v.s : Array.isArray(v) ? v.map(part).join('') : esc(v);

export function html(strings, ...values) {
  let out = '';
  strings.forEach((str, i) => { out += str; if (i < values.length) out += part(values[i]); });
  return new Markup(out);
}
