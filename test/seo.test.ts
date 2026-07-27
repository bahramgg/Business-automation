import { describe, expect, it } from 'vitest';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { localeAlternates } from '@/lib/seo';
import { routing } from '@/i18n/routing';

describe('localeAlternates', () => {
  it('builds a canonical and one alternate per locale', () => {
    const alt = localeAlternates('fa', '/services/website');
    expect(alt.canonical).toBe('/fa/services/website');
    expect(Object.keys(alt.languages).sort()).toEqual([...routing.locales].sort());
    expect(alt.languages.en).toBe('/en/services/website');
  });

  it('handles the home route', () => {
    expect(localeAlternates('en').canonical).toBe('/en');
  });
});

// Regression: a page's `alternates` replaces the layout's instead of merging,
// so a page that hardcodes only `canonical` silently ships without hreflang.
describe('every page ships hreflang', () => {
  it('never declares a canonical without languages', async () => {
    const offenders: string[] = [];

    async function* walk(dir: string): AsyncGenerator<string> {
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) yield* walk(path);
        else if (entry.name === 'page.tsx') yield path;
      }
    }

    for await (const file of walk(join(process.cwd(), 'src/app'))) {
      const source = await readFile(file, 'utf8');
      if (!source.includes('alternates:')) continue;
      const usesHelper = source.includes('localeAlternates(');
      const declaresLanguages = /languages/.test(source);
      if (!usesHelper && !declaresLanguages) {
        offenders.push(file.replace(process.cwd() + '/', ''));
      }
    }

    expect(offenders, 'use localeAlternates() so hreflang is emitted').toEqual([]);
  });
});
