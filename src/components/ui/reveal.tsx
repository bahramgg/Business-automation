'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

// Section entry animation (plan §2): a short fade + translateY, 200ms, with a
// 60ms stagger. One of only three motion patterns on the site.
//
// prefers-reduced-motion is honoured by rendering the final state immediately —
// no transition is ever started, rather than started and shortened.
export function Reveal({
  children,
  delayMs = 0,
  className,
}: {
  children: ReactNode;
  /** Stagger offset; use multiples of 60ms for adjacent items. */
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Start visible so the content is present even if JS never runs or the
  // observer is unsupported — the animation is an enhancement, not a gate.
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') return;

    const element = ref.current;
    if (!element) return;

    // Only hide once we know we can animate it back in.
    setShown(false);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={shown ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={cn(
        'transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  );
}
