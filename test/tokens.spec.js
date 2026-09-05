// Every NHL club has a jersey body and stripe token, and the bodies stay dark enough for the white number to read.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const CLUBS = ['ANA','BOS','BUF','CAR','CBJ','CGY','CHI','COL','DAL','DET','EDM','FLA','LAK','MIN','MTL','NJD','NSH','NYI','NYR','OTT','PHI','PIT','SEA','SJS','STL','TBL','TOR','UTA','VAN','VGK','WPG','WSH'];
const css = readFileSync('src/tokens.css', 'utf8');
const token = (name) => css.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`))?.[1];
const luminance = (hex) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };

describe('club colour tokens', () => {
  it('covers all 32 clubs plus the neutral', () => {
    for (const c of [...CLUBS, 'none']) {
      expect(token(`club-${c}-1`), `club-${c}-1`).toMatch(/^#/);
      expect(token(`club-${c}-2`), `club-${c}-2`).toMatch(/^#/);
    }
  });
  it('keeps every body dark enough for a white number', () => {
    for (const c of CLUBS) expect(luminance(token(`club-${c}-1`)), c).toBeLessThan(0.45);
  });
});
