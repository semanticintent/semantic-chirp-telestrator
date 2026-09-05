import { defineConfig } from '@playwright/test';

// npm run scenarios: every scenarios/*.txt is played through the page and screenshotted to test/shots/.
export default defineConfig({
  testDir: 'test',
  testMatch: 'scenarios.spec.js',
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
