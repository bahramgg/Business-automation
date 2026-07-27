import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Logo } from '@/components/ui/logo';

export function SiteFooter() {
  const t = useTranslations('Footer');
  const nav = useTranslations('Nav');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-10">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo label={nav('home')} />
            <p className="mt-3 text-sm text-muted">{t('tagline')}</p>
          </div>
          <div className="text-xs text-dim sm:text-end">
            <p>{t('rights', { year })}</p>
            <p className="mt-1">{t('note')}</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
