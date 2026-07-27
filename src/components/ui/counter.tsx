'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { formatNumber } from '@/lib/format';
import type { Locale } from '@/i18n/routing';

// Animated number that eases from its previous value to the target (plan §2).
// Honors prefers-reduced-motion by snapping. Formats per locale (Persian
// digits in fa) with tabular figures so the width doesn't jitter.
const DURATION = 500;

export function Counter({ value }: { value: number }) {
  const locale = useLocale() as Locale;
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const from = fromRef.current;
    const to = value;
    if (reduce || from === to) {
      fromRef.current = to;
      setDisplay(to);
      return;
    }

    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min((now - start) / DURATION, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      fromRef.current = to;
    };
  }, [value]);

  return (
    <span className="tnum tabular-nums">{formatNumber(Math.round(display), locale)}</span>
  );
}
