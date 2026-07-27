// Copies self-hosted woff2 font files from the @fontsource packages into
// public/fonts. No fonts are ever loaded from a CDN at runtime (plan §2, §10).
// Run with: npm run fonts:sync
import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'public/fonts');

// [package, sourceFile, destFile]
const files = [
  // Vazirmatn (FA) — Arabic + Latin subsets, weights 400/600/800
  ['vazirmatn', 'vazirmatn-arabic-400-normal.woff2', 'vazirmatn-400.woff2'],
  ['vazirmatn', 'vazirmatn-arabic-600-normal.woff2', 'vazirmatn-600.woff2'],
  ['vazirmatn', 'vazirmatn-arabic-800-normal.woff2', 'vazirmatn-800.woff2'],
  ['vazirmatn', 'vazirmatn-latin-400-normal.woff2', 'vazirmatn-latin-400.woff2'],
  ['vazirmatn', 'vazirmatn-latin-600-normal.woff2', 'vazirmatn-latin-600.woff2'],
  // Manrope (EN headings) — weights 400/600/800
  ['manrope', 'manrope-latin-400-normal.woff2', 'manrope-400.woff2'],
  ['manrope', 'manrope-latin-600-normal.woff2', 'manrope-600.woff2'],
  ['manrope', 'manrope-latin-800-normal.woff2', 'manrope-800.woff2'],
  // Inter (EN body) — weights 400/600
  ['inter', 'inter-latin-400-normal.woff2', 'inter-400.woff2'],
  ['inter', 'inter-latin-600-normal.woff2', 'inter-600.woff2'],
];

await mkdir(out, { recursive: true });
for (const [pkg, src, dest] of files) {
  const from = resolve(root, 'node_modules/@fontsource', pkg, 'files', src);
  await copyFile(from, resolve(out, dest));
  console.log(`✓ ${dest}`);
}
console.log(`\nSynced ${files.length} font files → public/fonts`);
