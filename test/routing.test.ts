import { describe, expect, it } from 'vitest';
import { routing, direction } from '@/i18n/routing';

describe('i18n routing', () => {
  it('defaults to Persian', () => {
    expect(routing.defaultLocale).toBe('fa');
  });

  it('supports exactly fa and en', () => {
    expect([...routing.locales].sort()).toEqual(['en', 'fa']);
  });

  it('maps direction per locale', () => {
    expect(direction.fa).toBe('rtl');
    expect(direction.en).toBe('ltr');
  });

  it('always prefixes the locale so / redirects to /fa', () => {
    expect(routing.localePrefix).toBe('always');
  });
});
