import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/ui/container';
import { Logo } from '@/components/ui/logo';

// Dark footer (plan §2, §4). Three link groups + the "no prices on the site"
// honesty note. Text comes from messages only.
export function SiteFooter() {
  const t = useTranslations('Footer');
  const nav = useTranslations('Nav');
  const year = new Date().getFullYear();

  const groups = [
    {
      title: t('colProduct'),
      links: [
        { label: t('servicesLink'), href: '/services' },
        { label: t('toolsLink'), href: '/tools' },
      ],
    },
    {
      title: t('colExplore'),
      links: [
        { label: t('workLink'), href: '/work' },
        { label: t('deliverablesLink'), href: '/deliverables' },
        { label: t('faqLink'), href: '/faq' },
      ],
    },
    {
      title: t('colFramework'),
      links: [
        { label: t('termsLink'), href: '/terms' },
        { label: t('contactLink'), href: '/contact' },
      ],
    },
  ];

  return (
    <footer className="mt-24 border-t border-border bg-bg-900">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo label={nav('home')} />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {t('tagline')}
            </p>
          </div>

          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-dim">
                {group.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-dim sm:flex-row sm:items-center sm:justify-between">
          <p>{t('rights', { year })}</p>
          <p>{t('note')}</p>
        </div>
      </Container>
    </footer>
  );
}
