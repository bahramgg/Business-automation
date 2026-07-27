import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/ui/container';
import { IconArrow } from '@/components/ui/icons';
import { domainIds } from '@/lib/domains';
import { formatIndex } from '@/lib/format';
import type { Locale } from '@/i18n/routing';

// The four automation domains — the site's spine (one domain = one page = one
// tool). They are numbered because the order is real: a business is found
// before it sells, sells before it fulfils, and only then has data to act on.
export function ServiceCards() {
  const t = useTranslations('Domains');
  const locale = useLocale() as Locale;

  return (
    <Container>
      <ul className="grid gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-2">
        {domainIds.map((id, index) => (
          <li key={id} className="bg-bg-950">
            <Link
              href={`/services/${id}`}
              className="flex h-full flex-col p-6 transition-colors hover:bg-surface/40 sm:p-8"
            >
              <span className="tnum text-xs text-dim">
                {formatIndex(index + 1, locale)}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-ink">
                {t(`cards.${id}.title`)}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {t(`cards.${id}.body`)}
              </p>
              <span className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
                <span className="text-xs text-dim">
                  {t('toolPrefix')}: {t(`cards.${id}.tool`)}
                </span>
                <IconArrow className="h-4 w-4 shrink-0 text-dim rtl:-scale-x-100" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
