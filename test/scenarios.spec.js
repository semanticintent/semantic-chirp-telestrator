// Plays every scenarios/*.txt through the real page, checks each ack, and screenshots each step to test/shots/.
import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync, mkdirSync } from 'node:fs';

const fixture = (name) => JSON.parse(readFileSync(`fixtures/${name}.json`, 'utf8'));
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'content-type': 'application/json' };

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
      if (line.startsWith('wipe')) { expect(state.circle).toBeNull(); expect(state.replay).toBeNull(); }
      if (line.startsWith('split')) expect(state.replay?.ids).toEqual(line.split(/\s+/).slice(1, 3));
      if (line.startsWith('replay')) expect(state.replay?.ids).toEqual([line.split(/\s+/)[1]]);
      if (line.startsWith('cut_to')) {
        const view = line.split(/\s+/)[1];
        expect(state.windows[view].open).toBe(true);
        expect(await page.locator(`.win[data-name="${view}"].focus`).count()).toBe(1);
      }
      if (line.startsWith('read_ice')) { expect(state.windows.panel.open).toBe(true); expect(state.windows.hand.open).toBe(true); }
      expect(state.log.at(-1)).toEqual({ line, ack });
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

test('talkback resolves a surname to an id, and the transcript shows what was typed', async ({ page }) => {
  await boot(page);
  for (const l of ['cue_roster cgy-week1', 'read_ice']) await page.evaluate((x) => window.telestrator.run(x), l);
  const ack = await page.evaluate(() => window.telestrator.submit('circle Zary'));
  expect(ack.circled).toBe('zary');
  await expect(page.locator('[data-view="console"] .log')).toContainText('> circle zary');
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

test('an agent with WebMCP sees every move and can make one', async ({ page }) => {
  await page.addInitScript(() => {
    navigator.modelContext = { tools: [], async registerTool(t) { this.tools.push(t); } };
  });
  await boot(page);
  await page.evaluate(() => window.telestrator.webmcp);
  await expect(page.locator('#site-tools-label')).toHaveText(/7 registered/);
  const names = await page.evaluate(() => navigator.modelContext.tools.map((t) => t.name));
  expect(names).toEqual(await page.evaluate(() => window.telestrator.moves));
  const ack = await page.evaluate(async () => {
    const tool = (n) => navigator.modelContext.tools.find((t) => t.name === n);
    await tool('cue_roster').execute({ fixture: 'cgy-week1' });
    await tool('read_ice').execute({});
    return tool('circle').execute({ ids: ['zary'], reason: 'the agent said so' });
  });
  expect(ack).toEqual({ circled: 'zary', reason: 'the agent said so' });
  const state = await page.evaluate(() => window.telestrator.state());
  expect(state.circle).toEqual({ id: 'zary', reason: 'the agent said so' });
  expect(state.log.at(-1).line).toMatch(/^agent circle /);
  await page.screenshot({ path: 'test/shots/webmcp-agent-circle.png' });
});

test('with an analyst configured, cue_roster posts the lineup and read_ice re-reads with the window', async ({ page }) => {
  const posts = [];
  await page.route('**/read', async (route) => {
    const body = JSON.parse(route.request().postData());
    posts.push(body);
    await route.fulfill({ status: 200, headers: CORS, body: JSON.stringify(body.look_ahead_days === 3 ? fixture('thin-week-no-opp') : fixture('cgy-week1')) });
  });
  await page.goto('/?analyst=http://analyst.test');
  await page.waitForFunction(() => window.telestrator?.ready === true);
  await expect(page.locator('#mode-label')).toHaveText(/live/);
  const cued = await page.evaluate(() => window.telestrator.call('cue_roster', { text: 'Zary LW\nGridin LW' }));
  expect(cued).toEqual({ cued: 'fx-cgy-week1', skaters: 15 });
  const read = await page.evaluate(() => window.telestrator.run('read_ice 3 2026-10-05'));
  expect(read.read).toBe('fx-thin-week');
  expect(posts.map((p) => [p.roster_text, p.look_ahead_days, p.start])).toEqual([['Zary LW\nGridin LW', 7, undefined], ['Zary LW\nGridin LW', 3, '2026-10-05']]);
  const state = await page.evaluate(() => window.telestrator.state());
  expect(state.source).toEqual({ mode: 'live', text: 'Zary LW\nGridin LW' });
});

test('a read the screen cannot draw is refused in the transcript, not drawn', async ({ page }) => {
  await page.route('**/read', (route) => route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ contract_version: '0.1', skaters: 'many' }) }));
  await page.goto('/?analyst=http://analyst.test');
  await page.waitForFunction(() => window.telestrator?.ready === true);
  const ack = await page.evaluate(() => window.telestrator.call('cue_roster', { text: 'Zary LW' }));
  expect(ack.error).toMatch(/cannot draw: read\./);
  expect((await page.evaluate(() => window.telestrator.state())).read).toBeNull();
});

test('an analyst that does not answer is reported, and fixtures still work without one', async ({ page }) => {
  await page.route('**/read', (route) => route.abort());
  await page.goto('/?analyst=http://analyst.test');
  await page.waitForFunction(() => window.telestrator?.ready === true);
  const ack = await page.evaluate(() => window.telestrator.call('cue_roster', { text: 'Zary LW' }));
  expect(ack.error).toMatch(/did not answer at http:\/\/analyst\.test/);
  await page.goto('/');
  await page.waitForFunction(() => window.telestrator?.ready === true);
  const noAnalyst = await page.evaluate(() => window.telestrator.call('cue_roster', { text: 'Zary LW' }));
  expect(noAnalyst.error).toMatch(/No analyst is configured/);
  expect(await page.evaluate(() => window.telestrator.run('cue_roster cgy-week1'))).toEqual({ cued: 'fx-cgy-week1', skaters: 15 });
});
