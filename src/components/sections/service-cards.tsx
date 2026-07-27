import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import {
  IconStore,
  IconBot,
  IconAutomation,
  IconSpark,
  IconArrow,
} from '@/components/ui/icons';

// The three service cards — the anti-confusion spine (plan §4.4, §5). Shared by
// the home "services map" and the /services overview so the mental model is
// identical wherever it appears.
const cards = [
  { id: 'website', href: '/services/website', Icon: IconStore },
  { id: 'assistant', href: '/services/assistant', Icon: IconBot },
  { id: 'automation', href: '/services/automation', Icon: IconAutomation },
] as const;

export function ServiceCards() {
  const t = useTranslations('Services');

  return (
    <Container>
      <div className="grid gap-5 lg:grid-cols-3">
        {cards.map(({ id, href, Icon }) => (
          <Card key={id} topline className="flex flex-col">
            <span className="text-lilac grid h-11 w-11 place-items-center rounded-field border border-border">
              <Icon />
            </span>
            <h3 className="mt-5 text-lg font-bold text-ink">
              {t(`cards.${id}.title`)}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {t(`cards.${id}.body`)}
            </p>

            {/* Tool chip — names the live tool this service owns. */}
            <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-pill border border-border-glass px-3 py-1.5 text-xs font-semibold text-muted">
              <IconSpark className="h-3.5 w-3.5 text-lilac" />
              {t('toolPrefix')}: {t(`cards.${id}.tool`)}
            </span>

            <Link
              href={href}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-lilac"
            >
              {t('linkLabel')}
              <IconArrow className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
          </Card>
        ))}
      </div>
    </Container>
  );
}
