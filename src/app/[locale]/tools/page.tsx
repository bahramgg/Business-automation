import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Link } from '@/i18n/navigation';
import { IconArrow } from '@/components/ui/icons';

// Ownership order from plan §5: start tool, the three service tools, closer.
const tools = ['roi', 'audit', 'demo', 'repeat', 'scope'] as const;

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'ToolsPage' });
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: { canonical: `/${locale}/tools` },
  };
}

// /tools — an index, not a sales page: one line per tool and nothing else
// (plan §3). It exists for people who came looking for a tool directly.
export default async function ToolsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ToolsPage' });

  return (
    <div className="pb-24 pt-16 sm:pt-20">
      <SectionHeading
        eyebrow={t('eyebrow')}
        title={t('title')}
        subtitle={t('subtitle')}
      />

      <Container className="mt-12">
        <ul className="mx-auto max-w-2xl divide-y divide-border overflow-hidden rounded-card border border-border bg-surface/40">
          {tools.map((id) => (
            <li key={id}>
              <Link
                href={`/tools/${id}`}
                className="flex items-center justify-between gap-4 px-5 py-5 transition-colors hover:bg-surface/60"
              >
                <span>
                  <span className="block text-base font-bold text-ink">
                    {t(`items.${id}.name`)}
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    {t(`items.${id}.line`)}
                  </span>
                </span>
                <IconArrow className="h-5 w-5 shrink-0 text-dim rtl:-scale-x-100" />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
