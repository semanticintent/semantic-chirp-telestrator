// The only file that talks to GSAP. Sequences are data (./sequences/*.json); this interprets a small fixed vocabulary of `do` verbs.
// Targets are `data-seq` names on elements the views rendered in their final state. Reduced motion runs everything at duration zero.
import { gsap } from 'gsap';

const files = import.meta.glob('./sequences/*.json', { eager: true, import: 'default' });
export const sequences = Object.fromEntries(Object.entries(files).map(([p, s]) => [p.split('/').pop().replace(/\.json$/, ''), s]));

const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// Each verb: (timeline, elements, step) → adds tweens at step.at. Durations already scaled.
export const VERBS = {
  reveal: (tl, els, s) => tl.fromTo(els, { opacity: 0 }, { opacity: 1, duration: s.duration, ease: s.ease, stagger: s.stagger }, s.at),
  fade_in: (tl, els, s) => tl.fromTo(els, { opacity: 0 }, { opacity: 1, duration: s.duration, ease: s.ease }, s.at),
  fade_out: (tl, els, s) => tl.to(els, { opacity: 0, duration: s.duration, ease: s.ease }, s.at),
  dim: (tl, els, s) => tl.to(els, { opacity: 0.35, duration: s.duration, ease: s.ease }, s.at),
  sweep: (tl, els, s) => tl.fromTo(els, { attr: { r: 0 } }, { attr: { r: (i, el) => +el.getAttribute('r') }, duration: s.duration, ease: s.ease, stagger: s.stagger }, s.at),
  fill: (tl, els, s) => tl.fromTo(els, { attr: { width: 0 } }, { attr: { width: (i, el) => +el.dataset.toWidth }, duration: s.duration, ease: s.ease, stagger: s.stagger }, s.at),
  flip: (tl, els, s) => tl.fromTo(els, { scale: 0.6, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: s.duration, ease: s.ease, stagger: s.stagger }, s.at),
  drop: (tl, els, s) => tl.fromTo(els, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: s.duration, ease: s.ease, stagger: s.stagger }, s.at),
};

let active = [];

export function play(name, root = document) {
  const seq = sequences[name];
  if (!seq) return null;
  const k = reduced() ? 0 : 1;
  const tl = gsap.timeline();
  for (const step of seq.steps) {
    const els = [...root.querySelectorAll(`[data-seq~="${step.target}"]`)];
    const verb = VERBS[step.do];
    if (!els.length || !verb) continue;
    verb(tl, els, { ...step, at: (step.at ?? 0) * k, duration: (step.duration ?? 0.5) * k, stagger: (step.stagger ?? 0) * k, ease: step.ease ?? 'power2.out' });
  }
  active.push(tl);
  tl.then(() => { active = active.filter((t) => t !== tl); });
  return tl;
}

/** Resolves when every running sequence has finished. The scenario runner screenshots after this. */
export const settled = () => Promise.all(active.map((t) => t.then())).then(() => undefined);
