// Writes docs/grammar.md from src/grammar.js. Loads through Vite so import.meta.glob resolves the same way it does in the page.
import { createServer } from 'vite';
import { writeFileSync } from 'node:fs';

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { grammar } = await vite.ssrLoadModule('/src/grammar.js');
  const { grammarDoc } = await vite.ssrLoadModule('/src/grammar-doc.js');
  writeFileSync('docs/grammar.md', grammarDoc(grammar));
  console.log(`docs/grammar.md: ${grammar.length} moves`);
} finally {
  await vite.close();
}
