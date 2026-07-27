import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { ToolBlock } from '@/components/tools/tool-block';
import { RoiCalculator } from '@/components/tools/roi-calculator';
import { decodeRoiParams } from '@/lib/roi';

// Rendered per-request so a shared ?m=…&a=…&v=…&r=… link hydrates the tool
// server-side with the shared numbers (plan §5.1: shareable state).
export const dynamic = 'force-dynamic';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Roi' });
  return {
    title: t('full.title'),
    description: t('full.intro'),
    // Canonical points at this page so the compact copies on the home and
    // service pages don't create duplicate content (plan §3, §16).
    alternates: { canonical: `/${locale}/tools/roi` },
  };
}

// Full tool (plan §3 "full mode"): the calculator + method & assumptions, with
// its state hydrated from the shareable URL params.
export default async function RoiToolPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Roi' });
  const initial = decodeRoiParams(await props.searchParams);

  const assumptions = t.raw('full.assumptions') as string[];

  return (
    <div className="py-16 sm:py-20">
      <Container>
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-dim">
            {t('eyebrow')}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
            {t('full.title')}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            {t('full.intro')}
          </p>
        </div>
      </Container>

      <Container className="mt-10">
        <ToolBlock>
          <RoiCalculator variant="full" initial={initial} />
        </ToolBlock>
      </Container>

      {/* Method & assumptions — full mode only (plan §3, §5.1 honesty). */}
      <Container className="mt-12">
        <div className="max-w-2xl rounded-card border border-border bg-surface/40 p-6">
          <h2 className="text-lg font-bold text-ink">{t('full.methodTitle')}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {t('full.methodBody')}
          </p>
          <ul className="mt-4 space-y-2">
            {assumptions.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lilac" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </div>
  );
}
