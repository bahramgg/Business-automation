import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Card } from '@/components/ui/card';
import { IconArrow } from '@/components/ui/icons';
import type { WorkCase } from '@/lib/work';
import { formatNumber } from '@/lib/format';
import type { Locale } from '@/i18n/routing';

// Grid card for one case study (plan §6). A confidential case keeps its slot —
// it's anonymized, never removed — and says so on a chip.
export function WorkCard({ item }: { item: WorkCase }) {
  const t = useTranslations('WorkPage');
  const locale = useLocale() as Locale;

  return (
    <Card className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-pill border border-border px-3 py-1 text-xs font-semibold text-muted">
          {item.vertical}
        </span>
        {item.confidential ? (
          <span className="rounded-pill border border-border-glass px-3 py-1 text-xs font-semibold text-lilac">
            {t('confidentialLabel')}
          </span>
        ) : null}
      </div>

      <h3 className="mt-4 text-lg font-bold leading-snug text-ink">
        {item.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
        {item.summary}
      </p>

      <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-dim">
        <div className="flex gap-1.5">
          <dt>{t('duration')}:</dt>
          <dd className="text-muted">{item.duration}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt>{t('modules')}:</dt>
          <dd className="text-muted">
            {formatNumber(item.modules.length, locale)}
          </dd>
        </div>
      </dl>

      <Link
        href={`/work/${item.slug}`}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-lilac"
      >
        {t('readCase')}
        <IconArrow className="h-4 w-4 rtl:-scale-x-100" />
      </Link>
    </Card>
  );
}
