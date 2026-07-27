import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { ToolBlock } from '@/components/tools/tool-block';
import { RepeatCalculator } from '@/components/tools/repeat-calculator';
import { decodeRepeatParams } from '@/lib/repeat';

// Rendered per request so a shared ?c&p&n&b link hydrates server-side.
export const dynamic = 'force-dynamic';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Repeat' });
  return {
    title: t('full.title'),
    description: t('full.intro'),
    alternates: { canonical: `/${locale}/tools/repeat` },
  };
}

// Full mode for the repeat-customer calculator — the sibling of /tools/roi
// (plan §5.5). Kept on its own route so no page shows two tools at once.
export default async function RepeatToolPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Repeat' });
  const initial = decodeRepeatParams(await props.searchParams);
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
          <RepeatCalculator variant="full" initial={initial} />
        </ToolBlock>
      </Container>

      <Container className="mt-12">
        <div className="max-w-2xl rounded-card border border-border bg-surface/40 p-6">
          <h2 className="text-lg font-bold text-ink">{t('full.methodTitle')}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t('full.methodBody')}</p>
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
