import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { IconMessage, IconGrid, IconReturn } from '@/components/ui/icons';

const cards = [
  { id: 'unanswered', Icon: IconMessage },
  { id: 'catalog', Icon: IconGrid },
  { id: 'forgotten', Icon: IconReturn },
] as const;

// "The problem" — three concrete failure points (plan §4.2). Explanatory
// cards: no gradient hairline, no tool chip.
export function Problem() {
  const t = useTranslations('Problem');

  return (
    <section className="py-16 sm:py-20">
      <SectionHeading eyebrow={t('eyebrow')} title={t('title')} />
      <Container className="mt-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ id, Icon }) => (
            <Card key={id}>
              <span className="grid h-11 w-11 place-items-center rounded-field border border-border text-lilac">
                <Icon />
              </span>
              <h3 className="mt-5 text-lg font-bold text-ink">
                {t(`cards.${id}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {t(`cards.${id}.body`)}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
