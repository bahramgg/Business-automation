import { describe, expect, it } from 'vitest';
import { getWorkCases, getWorkCase } from '@/lib/work';
import { routing } from '@/i18n/routing';
import { isVerticalId } from '@/lib/demo/verticals';
import { domainIds } from '@/lib/domains';

// Case-study content rules (plan §6, §9). These read the real content/
// directory, so they also guard the shipped MDX against malformed frontmatter.
describe('work content', () => {
  it('loads Persian cases with complete frontmatter', async () => {
    const cases = await getWorkCases('fa');
    expect(cases.length).toBeGreaterThan(0);
    for (const item of cases) {
      expect(item.slug).toBeTruthy();
      expect(item.title).toBeTruthy();
      expect(item.summary).toBeTruthy();
      expect(item.vertical).toBeTruthy();
      expect(item.body.trim().length).toBeGreaterThan(0);
    }
  });

  it('gives every case an interactive artifact', async () => {
    for (const locale of routing.locales) {
      for (const item of await getWorkCases(locale)) {
        expect(item.artifact, `${locale}/${item.slug} has no artifact`).toBeDefined();
      }
    }
  });

  // The case artifact must open on that case's own sector, so the chat answers
  // from the matching catalog rather than the default one.
  it('declares a known vertical for every demo artifact', async () => {
    for (const locale of routing.locales) {
      for (const item of await getWorkCases(locale)) {
        if (item.artifact?.type === 'demo') {
          expect(
            isVerticalId(item.artifact.vertical),
            `${locale}/${item.slug}: unknown vertical "${item.artifact.vertical}"`,
          ).toBe(true);
        }
      }
    }
  });

  // Case studies are the proof for the four-domain offer, so each one has to
  // say which domains it covered — otherwise it reads as generic work.
  it('names at least one known domain per case', async () => {
    for (const locale of routing.locales) {
      for (const item of await getWorkCases(locale)) {
        expect(item.domains.length, `${locale}/${item.slug}`).toBeGreaterThan(0);
        for (const d of item.domains) {
          expect(domainIds).toContain(d);
        }
      }
    }
  });

  it('points every artifact at a tool that exists', async () => {
    const tools = ['demo', 'roi', 'workload', 'repeat'];
    for (const locale of routing.locales) {
      for (const item of await getWorkCases(locale)) {
        if (item.artifact) expect(tools).toContain(item.artifact.type);
      }
    }
  });

  it('hides a case in a locale it has no translation for', async () => {
    // apparel-store is intentionally Persian-only; it must not leak into /en.
    expect(await getWorkCase('fa', 'apparel-store')).not.toBeNull();
    expect(await getWorkCase('en', 'apparel-store')).toBeNull();

    const enSlugs = (await getWorkCases('en')).map((c) => c.slug);
    expect(enSlugs).not.toContain('apparel-store');
  });

  it('keeps a translated case visible in both locales', async () => {
    for (const locale of routing.locales) {
      expect(await getWorkCase(locale, 'naranj-restaurant')).not.toBeNull();
    }
  });

  it('anonymizes rather than drops a confidential case', async () => {
    const item = await getWorkCase('fa', 'apparel-store');
    expect(item?.confidential).toBe(true);
    // Still listed — confidentiality means anonymized, not removed (plan §6).
    expect((await getWorkCases('fa')).map((c) => c.slug)).toContain('apparel-store');
  });

  it('returns null for an unknown slug', async () => {
    expect(await getWorkCase('fa', 'no-such-case')).toBeNull();
  });
});
