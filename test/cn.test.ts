import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/cn';

describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('drops falsy values', () => {
    const active = false;
    expect(cn('a', active && 'b', null, undefined, 'c')).toBe('a c');
  });
});
