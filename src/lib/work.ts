// Case-study content layer (plan §6). Reads MDX from content/{locale}/work,
// validates frontmatter, and applies the two content rules:
//   - a case with no translation is NOT shown in that locale (never fall back
//     to the other language)
//   - a confidential case renders anonymized ("a business in X"), not hidden

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import type { Locale } from '@/i18n/routing';

export interface WorkFrontmatter {
  slug: string;
  title: string;
  vertical: string;
  year: number;
  duration: string;
  summary: string;
  cover?: string;
  stack: string[];
  modules: string[];
  /** When true the client's name/logo is hidden and the case is anonymized. */
  confidential: boolean;
  /** Optional interactive artifact to render (plan §6: every case has one). */
  artifact?: { type: 'demo'; vertical: string } | { type: 'roi' };
  /** Measurable outcome lines. Qualitative when there's no sourced number. */
  results?: string[];
}

export interface WorkCase extends WorkFrontmatter {
  /** Raw MDX body, compiled at render time. */
  body: string;
}

const WORK_DIR = 'content';

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

/**
 * Parse and validate one case file. Returns null when required fields are
 * missing, so a malformed file is skipped rather than breaking the page.
 */
function parseCase(fileName: string, raw: string): WorkCase | null {
  const { data, content } = matter(raw);
  const slug = typeof data.slug === 'string' ? data.slug : fileName.replace(/\.mdx$/, '');

  if (
    typeof data.title !== 'string' ||
    typeof data.summary !== 'string' ||
    typeof data.vertical !== 'string'
  ) {
    return null;
  }

  const artifact =
    data.artifact && typeof data.artifact === 'object'
      ? (data.artifact as WorkFrontmatter['artifact'])
      : undefined;

  return {
    slug,
    title: data.title,
    vertical: data.vertical,
    year: typeof data.year === 'number' ? data.year : 0,
    duration: typeof data.duration === 'string' ? data.duration : '',
    summary: data.summary,
    cover: typeof data.cover === 'string' ? data.cover : undefined,
    stack: asStringArray(data.stack),
    modules: asStringArray(data.modules),
    confidential: data.confidential === true,
    artifact,
    results: asStringArray(data.results),
    body: content,
  };
}

/** All cases available in this locale, newest first. */
export async function getWorkCases(locale: Locale): Promise<WorkCase[]> {
  const dir = join(process.cwd(), WORK_DIR, locale, 'work');
  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith('.mdx'));
  } catch {
    return []; // no cases translated for this locale yet
  }

  const cases = await Promise.all(
    files.map(async (file) => parseCase(file, await readFile(join(dir, file), 'utf8'))),
  );

  return cases
    .filter((c): c is WorkCase => c !== null)
    .sort((a, b) => b.year - a.year || a.slug.localeCompare(b.slug));
}

/** A single case, or null when it isn't translated into this locale. */
export async function getWorkCase(
  locale: Locale,
  slug: string,
): Promise<WorkCase | null> {
  const cases = await getWorkCases(locale);
  return cases.find((c) => c.slug === slug) ?? null;
}
