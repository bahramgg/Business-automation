import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/seo';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { ToolBlock } from '@/components/tools/tool-block';
import { LiveDemo } from '@/components/tools/live-demo';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Demo' });
  return {
    title: t('title'),
    description: t('subtitle'),
    // Canonical for the demo tool (plan §3) — the compact copy on
    // /services/assistant defers to this page.
    alternates: localeAlternates(locale, '/tools/demo'),
  };
}

// Full mode for the assistant demo: the same component plus the honesty note
// about the sample catalog (plan §3, §5.2).
export default async function DemoToolPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Demo' });

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
        <ToolBlock>
          <LiveDemo />
        </ToolBlock>
        <p className="mt-4 max-w-2xl text-xs leading-relaxed text-dim">
          {t('note')}
        </p>
      </Container>
    </div>
  );
}
