'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';

// FA|EN pill toggle. Switches locale while keeping the user on the same page
// (plan §9) by re-pushing the current pathname under the other locale.
export function LocaleSwitch() {
  const t = useTranslations('LocaleSwitch');
  const active = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(locale: Locale) {
    if (locale === active || isPending) return;
    startTransition(() => {
      router.replace(pathname, { locale });
    });
  }

  return (
    <div
      role="group"
      aria-label={t('label')}
      className="inline-flex items-center rounded-pill border border-border p-0.5"
    >
      {routing.locales.map((locale) => {
        const isActive = locale === active;
        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            aria-pressed={isActive}
            aria-label={t('switchTo', { locale: t(locale) })}
            onClick={() => switchTo(locale)}
            className={cn(
              'rounded-pill px-3 py-1 text-xs font-semibold transition-colors',
              isActive
                ? 'bg-brand text-white'
                : 'text-muted hover:text-ink',
            )}
          >
            {locale === 'en' ? 'EN' : 'FA'}
          </button>
        );
      })}
    </div>
  );
}
