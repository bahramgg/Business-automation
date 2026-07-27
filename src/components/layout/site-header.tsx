'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/ui/container';
import { Logo } from '@/components/ui/logo';
import { ButtonLink } from '@/components/ui/button-link';
import { LocaleSwitch } from './locale-switch';
import { cn } from '@/lib/cn';

const navItems = [
  { key: 'services', href: '/services' },
  { key: 'tools', href: '/tools' },
  { key: 'work', href: '/work' },
  { key: 'terms', href: '/terms' },
] as const;

// Floating glass header (plan §2, §4). Sticky, blurred, with the primary CTA,
// language switch, and a mobile disclosure menu.
export function SiteHeader() {
  const t = useTranslations('Nav');
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-3 z-50 px-3">
      <Container className="max-w-6xl px-0">
        <div className="glass mx-auto flex items-center justify-between gap-4 rounded-pill py-2 pe-2 ps-4">
          <Logo label={t('home')} />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="rounded-pill px-3 py-2 text-sm text-muted transition-colors hover:text-ink"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <LocaleSwitch />
            </div>
            <div className="hidden sm:block">
              <ButtonLink href="/contact" className="px-4 py-2">
                {t('cta')}
              </ButtonLink>
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? t('closeMenu') : t('openMenu')}
              className="grid h-10 w-10 place-items-center rounded-full border border-border text-ink md:hidden"
            >
              <span className="sr-only">{t('menu')}</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden
              >
                {open ? (
                  <path
                    d="M4 4l10 10M14 4L4 14"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M2 5h14M2 9h14M2 13h14"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <div
          className={cn(
            'glass mx-auto mt-2 overflow-hidden rounded-card md:hidden',
            open ? 'block' : 'hidden',
          )}
        >
          <nav className="flex flex-col p-2">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-field px-4 py-3 text-sm text-muted transition-colors hover:bg-surface/60 hover:text-ink"
              >
                {t(item.key)}
              </Link>
            ))}
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <LocaleSwitch />
              <ButtonLink
                href="/contact"
                onClick={() => setOpen(false)}
                className="px-4 py-2"
              >
                {t('cta')}
              </ButtonLink>
            </div>
          </nav>
        </div>
      </Container>
    </header>
  );
}
