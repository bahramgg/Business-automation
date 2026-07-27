import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

// Status pill — the green "live" chip from the reference. A pulsing dot marks
// it as live. Never render a fabricated metric inside it (plan §1).
export function Pill({
  children,
  tone = 'default',
  className,
}: {
  children: ReactNode;
  tone?: 'default' | 'success';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-pill border px-3.5 py-1.5 text-xs font-semibold',
        tone === 'success'
          ? 'border-border-glass text-muted'
          : 'border-border text-muted',
        className,
      )}
    >
      {tone === 'success' && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
      )}
      {children}
    </span>
  );
}
