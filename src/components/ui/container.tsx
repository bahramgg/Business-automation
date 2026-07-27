import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

// Centered content column with consistent gutters. Max width keeps line length
// readable on large screens; padding uses logical properties (RTL-safe).
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-5 sm:px-8', className)}>
      {children}
    </div>
  );
}
