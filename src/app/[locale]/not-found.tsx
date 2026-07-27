import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button-link';

// Localized 404, rendered inside the locale layout (header + footer intact).
export default function LocaleNotFound() {
  const t = useTranslations('NotFound');
  return (
    <Container className="py-28 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-dim">
        404
      </p>
      <h1 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
        {t('title')}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-muted">{t('body')}</p>
      <div className="mt-8">
        <ButtonLink href="/">{t('home')}</ButtonLink>
      </div>
    </Container>
  );
}
