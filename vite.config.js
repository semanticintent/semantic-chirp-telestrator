import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { renameSync, existsSync } from 'node:fs';

// dist/telestrator.html is the single-file build. Never edit it by hand.
const nameTheBuild = {
  name: 'telestrator-name-the-build',
  closeBundle() {
    if (existsSync('dist/index.html')) renameSync('dist/index.html', 'dist/telestrator.html');
  },
};

export default defineConfig({
  plugins: [viteSingleFile(), nameTheBuild],
  build: { outDir: 'dist', cssCodeSplit: false, assetsInlineLimit: 100_000_000 },
  test: {
    include: ['test/**/*.spec.js'],
    exclude: ['test/scenarios.spec.js', 'node_modules/**'],
  },
});
