import { defineConfig } from '@playwright/test';

// npm run scenarios: every scenarios/*.txt is played through the page and screenshotted to test/shots/.
export default defineConfig({
  testDir: 'test',
  projects: [
    // Every scenario, in stock Chromium (WebMCP absent; the agent scenario fakes modelContext).
    { name: 'scenarios', testMatch: 'scenarios.spec.js' },
    // The real thing: Chromium with WebMCP enabled exposes document.modelContext, and Sepiola registers against it.
    { name: 'webmcp-real', testMatch: 'webmcp-real.spec.js', use: { launchOptions: { args: ['--enable-features=WebMCP'] } } },
  ],
  timeout: 60_000,
  reporter: 'list',
  webServer: {
    command: 'npm run dev -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  },
});
