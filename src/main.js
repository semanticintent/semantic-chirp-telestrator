// Boot. Wires the viewer's touches (open, close, drag, click a skater, press why, type a move) and exposes the one dispatch
// path as window.telestrator for the scenario runner and, later, WebMCP.
import './fonts.css';
import './tokens.css';
import './screen.css';
import { run, call, getState, touch, moves } from './dispatch.js';
import { render } from './render.js';
import { settled } from './motion/runner.js';
import { open, close, move } from './state.js';
import { submit } from './talkback.js';
import { register } from './webmcp.js';
import { mode, analystUrl } from './analyst.js';
import { copy, fill } from './copy.js';

render(getState());

// Viewer touches. A click on a skater on the ice circles him; a bench or IR chip, or a panel's "why", runs it back.
document.addEventListener('click', (e) => {
  const opener = e.target.closest('[data-open]');
  if (opener) return touch((s) => open(s, opener.dataset.open));
  const closer = e.target.closest('[data-close]');
  if (closer) return touch((s) => close(s, closer.dataset.close));
  const why = e.target.closest('[data-replay]');
  if (why) return run(`replay ${why.dataset.replay}`);
  const chip = e.target.closest('.chip[data-id]');
  if (chip) return run(`replay ${chip.dataset.id}`);
  const skater = e.target.closest('svg [data-id]');
  if (skater) run(`circle ${skater.dataset.id}`);
});
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('svg [data-id]')) {
    e.preventDefault();
    run(`circle ${e.target.dataset.id}`);
  }
});

// Talkback: one move per line, surnames allowed where an id is expected.
const cmd = document.getElementById('cmd');
const cmdIn = document.getElementById('cmd-in');
cmd?.addEventListener('submit', (e) => {
  e.preventDefault();
  const line = cmdIn.value.trim();
  if (!line) return;
  cmdIn.value = '';
  submit(line);
});

// Windows: raise on pointerdown, drag by the head. Positions live in state.windows.
for (const win of document.querySelectorAll('.win')) {
  const name = win.dataset.name;
  const head = win.querySelector('.head');
  let sx, sy, ox, oy, dragging = false;
  win.addEventListener('pointerdown', () => touch((s) => open(s, name)));
  head.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    dragging = true; sx = e.clientX; sy = e.clientY;
    const r = win.getBoundingClientRect(); ox = r.left; oy = r.top;
    head.setPointerCapture(e.pointerId);
  });
  head.addEventListener('pointermove', (e) => {
    if (dragging) touch((s) => move(s, name, ox + e.clientX - sx, Math.max(44, oy + e.clientY - sy)));
  });
  head.addEventListener('pointerup', () => { dragging = false; });
}

// Paste a lineup: the live path to cue_roster. In fixture mode the analyst line says what to do instead.
document.getElementById('paste-go')?.addEventListener('click', () => {
  const text = document.getElementById('paste-in').value.trim();
  if (text) call('cue_roster', { text }, copy.console.pasted);
});

// Where the reads come from, and whether an agent can reach the moves.
document.getElementById('mode-label').textContent = mode() === 'live' ? fill(copy.siteTools.live, { url: analystUrl() }) : copy.siteTools.fixture;
const pill = document.getElementById('site-tools');
const pillLabel = document.getElementById('site-tools-label');
const webmcp = register().then((r) => {
  pillLabel.textContent = r.available ? fill(copy.siteTools.on, { n: r.registered }) : copy.siteTools.none;
  pill.classList.toggle('on', r.available && r.registered > 0);
  return r;
});

window.telestrator = { ready: true, run, call, submit, state: getState, settled, moves: moves(), webmcp };
