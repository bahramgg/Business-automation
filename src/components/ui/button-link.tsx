import type { ComponentProps } from 'react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'ghost';

const base =
  'inline-flex items-center justify-center gap-2 rounded-button px-5 py-3 text-sm font-semibold transition-[transform,box-shadow,background-color] duration-200 will-change-transform hover:-translate-y-0.5 focus-visible:outline-none';

const variants: Record<Variant, string> = {
  // Primary = brand gradient + glow (plan §2).
  primary: 'bg-brand text-white shadow-brand hover:shadow-[0_10px_36px_rgba(77,105,255,0.45)]',
  // Secondary = ghost with a token border.
  ghost: 'border border-border text-ink hover:border-border-glass hover:bg-surface/50',
};

// Locale-aware CTA. Wraps next-intl's <Link> so hrefs stay under the active
// locale. Text is passed in (never hardcoded) per CLAUDE.md.
export function ButtonLink({
  variant = 'primary',
  className,
  ...props
}: { variant?: Variant } & ComponentProps<typeof Link>) {
  return (
    <Link className={cn(base, variants[variant], className)} {...props} />
  );
}
