import { describe, expect, it } from 'vitest';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { clientNamespaces, pickClientMessages } from '@/i18n/client-namespaces';
import fa from '../messages/fa.json';
import type { AbstractIntlMessages } from 'next-intl';

// The catalog holds a few string[] values consumed via t.raw(), which don't fit
// the ICU message tree type — cast once here rather than loosening the lib type.
const catalog = fa as unknown as AbstractIntlMessages;

// Only client-used namespaces are serialized into the page (plan §14). If a new
// 'use client' component starts using a namespace that isn't shipped, its
// strings would be missing at runtime — so this test scans the source and
// fails before that can happen.

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.tsx?$/.test(entry.name)) yield path;
  }
}

describe('client message scoping', () => {
  it('ships every namespace used by a client component', async () => {
    const missing: string[] = [];

    for await (const file of walk(join(process.cwd(), 'src'))) {
      const source = await readFile(file, 'utf8');
      // Only files that actually run in the browser matter here.
      if (!/^['"]use client['"]/m.test(source)) continue;

      for (const match of source.matchAll(/useTranslations\(\s*['"]([^'"]+)['"]/g)) {
        const namespace = match[1]!;
        if (!(clientNamespaces as readonly string[]).includes(namespace)) {
          missing.push(`${namespace} (used in ${file.replace(process.cwd() + '/', '')})`);
        }
      }
    }

    expect(missing, 'add these to src/i18n/client-namespaces.ts').toEqual([]);
  });

  it('picks exactly the declared namespaces and drops the rest', () => {
    const picked = pickClientMessages(catalog);
    expect(Object.keys(picked).sort()).toEqual([...clientNamespaces].sort());
    // Server-only namespaces must not reach the browser.
    expect(picked).not.toHaveProperty('Faq');
    expect(picked).not.toHaveProperty('WorkPage');
  });

  it('is meaningfully smaller than the full catalog', () => {
    const full = JSON.stringify(catalog).length;
    const picked = JSON.stringify(pickClientMessages(catalog)).length;
    expect(picked).toBeLessThan(full * 0.75);
  });
});
