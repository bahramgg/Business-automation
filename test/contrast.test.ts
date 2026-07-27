import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Contrast is a DoD item (plan §14, §18): text must clear WCAG AA on the dark
// background — "--muted on --bg-950" is called out by name. Reading the real
// tokens means a token edit that breaks contrast fails the build, not review.

const tokens = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf8');

function token(name: string): string {
  const match = tokens.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`token --${name} not found`);
  return match[1]!;
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  ) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.1 contrast ratio, 1–21. */
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const AA_NORMAL = 4.5;
const AA_LARGE = 3; // ≥24px, or ≥18.66px bold

describe('contrast on the dark background', () => {
  const backgrounds = ['bg-950', 'bg-900', 'surface'] as const;

  it.each(backgrounds)('ink clears AA on --%s', (bg) => {
    expect(contrast(token('ink'), token(bg))).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  // The token the plan names explicitly — body copy colour on the page bg.
  it.each(backgrounds)('muted clears AA for body text on --%s', (bg) => {
    expect(contrast(token('muted'), token(bg))).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  // --dim is used only for small supporting labels, never body copy. It must
  // still clear the large-text threshold so it never becomes unreadable.
  it.each(backgrounds)('dim clears the large-text threshold on --%s', (bg) => {
    expect(contrast(token('dim'), token(bg))).toBeGreaterThanOrEqual(AA_LARGE);
  });

  it('lilac accent text clears AA on the page background', () => {
    expect(contrast(token('lilac'), token('bg-950'))).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it('success text clears the large-text threshold on the page background', () => {
    expect(contrast(token('success'), token('bg-950'))).toBeGreaterThanOrEqual(AA_LARGE);
  });

  it('white on the brand gradient stays readable at both ends', () => {
    for (const end of ['blue', 'violet'] as const) {
      expect(contrast('#ffffff', token(end))).toBeGreaterThanOrEqual(AA_LARGE);
    }
  });
});
