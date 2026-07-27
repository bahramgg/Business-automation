import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { ToolBlock } from '@/components/tools/tool-block';
import { WorkloadCalculator } from '@/components/tools/workload-calculator';
import { decodeWorkloadParams } from '@/lib/workload';
import { localeAlternates } from '@/lib/seo';

// Rendered per request so a shared ?s&h&d&k link hydrates server-side.
export const dynamic = 'force-dynamic';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Workload' });
  return {
    title: t('full.title'),
    description: t('full.intro'),
    alternates: localeAlternates(locale, '/tools/workload'),
  };
}

// Full mode for the operations domain's tool.
export default async function WorkloadToolPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Workload' });
  const initial = decodeWorkloadParams(await props.searchParams);
  const assumptions = t.raw('full.assumptions') as string[];

  return (
    <div className="py-16 sm:py-20">
      <Container>
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-wider text-dim">{t('eyebrow')}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {t('full.title')}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">{t('full.intro')}</p>
        </div>
      </Container>

      <Container className="mt-10">
        <ToolBlock>
          <WorkloadCalculator variant="full" initial={initial} />
        </ToolBlock>
      </Container>

      <Container className="mt-10">
        <div className="max-w-2xl border-t border-border pt-6">
          <h2 className="text-base font-semibold text-ink">{t('full.methodTitle')}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t('full.methodBody')}</p>
          <ul className="mt-4 space-y-2">
            {assumptions.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lilac" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </div>
  );
}
