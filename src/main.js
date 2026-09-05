// Boot. Wires the viewer's touches (open, close, drag, click a skater, press why, type a move) and exposes the one dispatch
// path as window.sepiola for the scenario runner and, later, WebMCP.
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

// Menus close after a choice or a click elsewhere.
const closeMenus = (except) => document.querySelectorAll('details.menu[open]').forEach((d) => { if (d !== except) d.removeAttribute('open'); });

/** Open the About window at a section. Sections are addressable as #about, #quickStart, #privacy, #terms, #disclaimer, #credits. */
function showAbout(section) {
  touch((s) => open(s, 'about'));
  const target = document.getElementById(`about-${section}`);
  const body = document.querySelector('#w-about .about-body');
  if (target && body) body.scrollTop = target.offsetTop - body.offsetTop - 44; // scroll the window's body, never the desktop
  if (section && location.hash !== `#${section}`) history.replaceState(null, '', `#${section}`);
}
const ABOUT_SECTIONS = ['about', 'quickStart', 'privacy', 'terms', 'disclaimer', 'credits'];
const openFromHash = () => { const h = location.hash.replace(/^#/, ''); if (ABOUT_SECTIONS.includes(h)) showAbout(h); };
window.addEventListener('hashchange', openFromHash);
openFromHash();

// Viewer touches. A click on a skater on the ice circles him; a bench or IR chip, or a panel's "why", runs it back.
document.addEventListener('click', (e) => {
  const menu = e.target.closest('details.menu');
  closeMenus(e.target.closest('summary') ? menu : null);
  if (e.target.closest('.menu-list')) menu?.removeAttribute('open');
  const aboutLink = e.target.closest('.about-nav a');
  if (aboutLink) { e.preventDefault(); return showAbout(aboutLink.getAttribute('href').slice(1)); }
  const aboutOpener = e.target.closest('[data-open-about]');
  if (aboutOpener) return showAbout(aboutOpener.dataset.openAbout);
  if (e.target.closest('[data-sample]')) return (async () => { await run('cue_roster cgy-week1'); await run('read_ice'); })();
  if (e.target.closest('[data-paste]')) {
    touch((s) => open(s, 'console'));
    const details = document.getElementById('paste'); if (details) details.open = true;
    document.getElementById('paste-in')?.focus();
    return;
  }
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

window.sepiola = { ready: true, run, call, submit, state: getState, settled, moves: moves(), webmcp, showAbout };
