// Fails the build if anything secret-shaped reaches the client bundle
// (CLAUDE.md: "if a model key is ever visible client-side, the build must
// fail"; plan §18). Runs automatically as `postbuild`.
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const targets = [join(root, '.next/static'), join(root, '.next/server')];

// Patterns that must never appear in code shipped to (or rendered for) a browser.
const forbidden = [
  { name: 'OpenRouter key name', re: /OPENROUTER_API_KEY/ },
  { name: 'OpenRouter key value', re: /sk-or-[A-Za-z0-9-]{8,}/ },
  { name: 'OpenAI key value', re: /sk-[A-Za-z0-9]{32,}/ },
  { name: 'Anthropic key value', re: /sk-ant-[A-Za-z0-9-]{8,}/ },
  { name: 'Cloudflare API token', re: /CLOUDFLARE_API_TOKEN/ },
];

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return; // directory absent (e.g. nothing built yet)
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.(js|mjs|cjs|json|html|txt)$/.test(entry.name)) yield path;
  }
}

const hits = [];
for (const target of targets) {
  for await (const file of walk(target)) {
    const content = await readFile(file, 'utf8');
    for (const { name, re } of forbidden) {
      if (re.test(content)) {
        hits.push(`${name} in ${file.replace(root + '/', '')}`);
      }
    }
  }
}

if (hits.length > 0) {
  console.error('\n✗ Secret material found in the built output:\n');
  for (const hit of hits) console.error(`  - ${hit}`);
  console.error('\nSecrets belong in Workers only (wrangler secret put).\n');
  process.exit(1);
}

console.log('✓ client bundle clean — no secret material found');
