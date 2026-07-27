import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/seo';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { ToolBlock } from '@/components/tools/tool-block';
import { AuditScan } from '@/components/tools/audit-scan';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Audit' });
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: localeAlternates(locale, '/tools/audit'),
  };
}

// Full mode for the online-presence scan (plan §5.3).
export default async function AuditToolPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Audit' });

  return (
    <div className="py-16 sm:py-20">
      <Container>
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-dim">
            {t('eyebrow')}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            {t('subtitle')}
          </p>
        </div>
      </Container>

      <Container className="mt-10">
        <div className="max-w-2xl">
          <ToolBlock>
            <AuditScan />
          </ToolBlock>
        </div>
      </Container>
    </div>
  );
}
