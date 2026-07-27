import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

// Content card on the deep-navy surface. `topline` adds the 2px brand gradient
// hairline used to mark interactive/tool-adjacent cards (plan §2). Explanatory
// cards use it off.
export function Card({
  children,
  className,
  topline = false,
}: {
  children: ReactNode;
  className?: string;
  topline?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-card border border-border bg-surface/60 p-6',
        'transition-colors duration-200 hover:border-border-glass',
        className,
      )}
    >
      {topline ? (
        <span
          aria-hidden
          className="bg-brand absolute inset-x-0 top-0 block h-0.5"
        />
      ) : null}
      {children}
    </div>
  );
}
