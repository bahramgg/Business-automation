'use client';

import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Logo } from '@/components/ui/logo';
import { LocaleSwitch } from './locale-switch';

// One page, so there is nothing to navigate: the header carries the mark, the
// language switch, and the single action.
export function SiteHeader() {
  const t = useTranslations('Nav');

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg-950/90 backdrop-blur">
      <Container>
        <div className="flex items-center justify-between gap-4 py-4">
          <Logo label={t('home')} />
          <div className="flex items-center gap-3">
            <LocaleSwitch />
            <a
              href="#contact"
              className="rounded-button bg-brand px-4 py-2 text-sm font-semibold text-white"
            >
              {t('cta')}
            </a>
          </div>
        </div>
      </Container>
    </header>
  );
}
