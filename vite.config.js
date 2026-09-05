import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { copyFileSync, existsSync } from 'node:fs';

// dist/sepiola.html is the single-file build for sharing; dist/index.html is the same file, where Pages expects it. Never edit either.
const nameTheBuild = {
  name: 'telestrator-name-the-build',
  closeBundle() {
    if (existsSync('dist/index.html')) copyFileSync('dist/index.html', 'dist/sepiola.html');
  },
};

// The production build defaults to the hosted analyst (D29); dev and tests stay in fixture mode unless ?analyst= says otherwise.
const HOSTED_ANALYST = 'https://chirp-edge.michshat.workers.dev';

export default defineConfig(({ mode }) => ({
  define: { __DEFAULT_ANALYST__: JSON.stringify(mode === 'production' ? (process.env.ANALYST_URL ?? HOSTED_ANALYST) : '') },
  plugins: [viteSingleFile(), nameTheBuild],
  build: { outDir: 'dist', cssCodeSplit: false, assetsInlineLimit: 100_000_000 },
  test: {
    include: ['test/**/*.spec.js'],
    exclude: ['test/scenarios.spec.js', 'node_modules/**'],
  },
}));
