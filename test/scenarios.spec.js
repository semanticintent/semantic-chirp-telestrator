// Plays every scenarios/*.txt through the real page, checks each ack, and screenshots each step to test/shots/.
import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync, mkdirSync } from 'node:fs';

const DIR = 'scenarios';
mkdirSync('test/shots', { recursive: true });
const scenarios = readdirSync(DIR).filter((f) => f.endsWith('.txt'));

async function boot(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/');
  await page.waitForFunction(() => window.telestrator?.ready === true);
  return errors;
}

for (const file of scenarios) {
  const name = file.replace(/\.txt$/, '');
  test(name, async ({ page }) => {
    const errors = await boot(page);
    const lines = readFileSync(`${DIR}/${file}`, 'utf8').split('\n').map((s) => s.trim()).filter((l) => l && !l.startsWith('#'));
    for (const [i, line] of lines.entries()) {
      const ack = await page.evaluate((l) => window.telestrator.run(l), line);
      expect(typeof ack, `${line} → ${JSON.stringify(ack)}`).toBe('object');
      expect(ack, `${line} → ${JSON.stringify(ack)}`).not.toHaveProperty('error');
      await page.evaluate(() => window.telestrator.settled());
      const state = await page.evaluate(() => window.telestrator.state());
      if (line.startsWith('circle')) expect(state.circle?.id).toBe(line.split(/\s+/)[1]);
      if (line.startsWith('wipe')) expect(state.circle).toBeNull();
      await page.screenshot({ path: `test/shots/${name}-${String(i + 1).padStart(2, '0')}-${line.split(/\s+/)[0]}.png` });
    }
    expect(errors).toEqual([]);
  });
}

test('a move the grammar does not know is refused, not thrown', async ({ page }) => {
  await boot(page);
  const ack = await page.evaluate(() => window.telestrator.run('rank gridin'));
  expect(ack).toHaveProperty('error');
});

test('a circle persists until wiped', async ({ page }) => {
  await boot(page);
  for (const l of ['cue_roster cgy-week1', 'read_ice', 'circle zary']) await page.evaluate((x) => window.telestrator.run(x), l);
  await page.evaluate(() => window.telestrator.settled());
  await page.waitForTimeout(1500);
  expect(await page.locator('[data-view="spot"] .callout').count()).toBe(1);
  await page.evaluate(() => window.telestrator.run('wipe'));
  expect(await page.locator('[data-view="spot"] .callout').count()).toBe(0);
});
