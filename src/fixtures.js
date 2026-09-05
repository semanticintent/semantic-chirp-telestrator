// Reads the screen can run without an analyst. Keyed by file name without extension.
const files = import.meta.glob('../fixtures/*.json', { eager: true, import: 'default' });
export const fixtures = Object.fromEntries(
  Object.entries(files).map(([path, read]) => [path.split('/').pop().replace(/\.json$/, ''), read]),
);
