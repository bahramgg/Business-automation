import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { IconSpark, IconArrow } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

// The standard interactive-tool block (plan §2 "explain vs. tool" contract):
// glass card + 2px brand hairline on top + the fixed chip
// "⟡ Interactive tool — result is an estimate" + an optional "full version"
// link. EVERY tool renders inside this shell so no tool block is ever
// published without the chip and the same shape (plan §18).
export function ToolBlock({
  children,
  fullHref,
  className,
}: {
  children: ReactNode;
  fullHref?: string;
  className?: string;
}) {
  const t = useTranslations('DomainCommon');

  return (
    <div
      id="tool"
      className={cn(
        'glass relative overflow-hidden rounded-card scroll-mt-28',
        className,
      )}
    >
      <span aria-hidden className="bg-brand absolute inset-x-0 top-0 block h-0.5" />

      <div className="flex items-center gap-2 border-b border-border-glass px-5 py-3">
        <IconSpark className="h-4 w-4 shrink-0 text-lilac" />
        <span className="text-xs font-semibold text-muted">{t('toolChip')}</span>
      </div>

      <div className="p-6">{children}</div>

      {fullHref ? (
        <div className="border-t border-border-glass px-5 py-3">
          <Link
            href={fullHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-lilac"
          >
            {t('toolFullLink')}
            <IconArrow className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

// Placeholder body used until each tool ships (Phase 3+). Honest "coming"
// state — not lorem — kept inside the same ToolBlock shell.
export function ToolComingSoon() {
  const t = useTranslations('DomainCommon');
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full border border-border-glass text-lilac">
        <IconSpark />
      </span>
      <p className="text-base font-bold text-ink">{t('toolComingTitle')}</p>
      <p className="max-w-sm text-sm leading-relaxed text-muted">
        {t('toolComingBody')}
      </p>
    </div>
  );
}
