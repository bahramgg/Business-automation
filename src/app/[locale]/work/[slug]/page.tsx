import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { ButtonLink } from '@/components/ui/button-link';
import { Link } from '@/i18n/navigation';
import { IconArrow } from '@/components/ui/icons';
import { ToolBlock } from '@/components/tools/tool-block';
import { LiveDemo } from '@/components/tools/live-demo';
import { RoiCalculator } from '@/components/tools/roi-calculator';
import { getWorkCase, getWorkCases } from '@/lib/work';
import { formatList, formatYear } from '@/lib/format';
import { routing, type Locale } from '@/i18n/routing';
import { isVerticalId } from '@/lib/demo/verticals';

export async function generateStaticParams() {
  const params: Array<{ locale: string; slug: string }> = [];
  for (const locale of routing.locales) {
    for (const item of await getWorkCases(locale)) {
      params.push({ locale, slug: item.slug });
    }
  }
  return params;
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const item = await getWorkCase(locale as Locale, slug);
  if (!item) return {};
  // Only advertise the locales this case is actually translated into — an
  // hreflang pointing at a 404 is worse than none (plan §6, §9).
  const translated = await Promise.all(
    routing.locales.map(async (l) => ({ l, has: (await getWorkCase(l, slug)) !== null })),
  );
  const languages = Object.fromEntries(
    translated.filter((entry) => entry.has).map((entry) => [entry.l, `/${entry.l}/work/${slug}`]),
  );

  return {
    title: item.title,
    description: item.summary,
    alternates: { canonical: `/${locale}/work/${slug}`, languages },
  };
}

// Styling for the MDX body — headings and paragraphs only; the case content
// stays plain prose (plan §6).
const mdxComponents = {
  h2: (props: React.ComponentProps<'h2'>) => (
    <h2 className="mt-10 text-2xl font-extrabold tracking-tight text-ink" {...props} />
  ),
  h3: (props: React.ComponentProps<'h3'>) => (
    <h3 className="mt-8 text-lg font-bold text-ink" {...props} />
  ),
  p: (props: React.ComponentProps<'p'>) => (
    <p className="mt-4 text-base leading-relaxed text-muted" {...props} />
  ),
  ul: (props: React.ComponentProps<'ul'>) => (
    <ul className="mt-4 space-y-2 text-base text-muted" {...props} />
  ),
};

export default async function WorkCasePage(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);
  const item = await getWorkCase(locale as Locale, slug);
  // Not translated into this locale → 404 here, never show the other language.
  if (!item) notFound();

  const t = await getTranslations({ locale, namespace: 'WorkPage' });
  const tc = await getTranslations({ locale, namespace: 'Cta' });
  const typedLocale = locale as Locale;

  return (
    <article className="py-16 sm:py-20">
      <Container>
        <Link
          href="/work"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
        >
          <IconArrow className="h-4 w-4 rotate-180 rtl:rotate-0" />
          {t('backToWork')}
        </Link>

        <div className="mt-6 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-pill border border-border px-3 py-1 text-xs font-semibold text-muted">
              {item.vertical}
            </span>
            {item.confidential ? (
              <span className="rounded-pill border border-border-glass px-3 py-1 text-xs font-semibold text-lilac">
                {t('confidentialLabel')}
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
            {item.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            {item.summary}
          </p>

          {item.confidential ? (
            <p className="mt-4 text-xs text-dim">{t('confidentialNote')}</p>
          ) : null}
        </div>
      </Container>

      {/* Facts strip */}
      <Container className="mt-10">
        <dl className="grid gap-4 rounded-card border border-border bg-surface/40 p-6 sm:grid-cols-4">
          {[
            { label: t('year'), value: formatYear(item.year, typedLocale) },
            { label: t('duration'), value: item.duration },
            { label: t('stack'), value: formatList(item.stack, typedLocale) },
            { label: t('modules'), value: formatList(item.modules, typedLocale) },
          ].map((row) => (
            <div key={row.label}>
              <dt className="text-xs uppercase tracking-wider text-dim">{row.label}</dt>
              <dd className="mt-1.5 text-sm text-muted">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Container>

      {/* Body */}
      <Container className="mt-4">
        <div className="max-w-3xl">
          <MDXRemote source={item.body} components={mdxComponents} />
        </div>
      </Container>

      {/* Measurable results */}
      {item.results && item.results.length > 0 ? (
        <Container className="mt-12">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-extrabold tracking-tight text-ink">
              {t('resultsTitle')}
            </h2>
            <ul className="mt-6 space-y-3">
              {item.results.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3 rounded-field border border-border bg-surface/40 p-4"
                >
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                  <span className="text-sm text-muted">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      ) : null}

      {/* Interactive artifact — every case has one (plan §6) */}
      {item.artifact ? (
        <Container className="mt-14">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">
            {t('artifactTitle')}
          </h2>
          <div className="mt-6">
            <ToolBlock
              fullHref={item.artifact.type === 'demo' ? '/tools/demo' : '/tools/roi'}
            >
              {item.artifact.type === 'demo' ? (
                // The artifact opens on this case's own sector (plan §6).
                <LiveDemo
                  initialVertical={
                    isVerticalId(item.artifact.vertical)
                      ? item.artifact.vertical
                      : undefined
                  }
                />
              ) : (
                <RoiCalculator />
              )}
            </ToolBlock>
          </div>
        </Container>
      ) : null}

      <Container className="mt-14">
        <Card className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">{tc('subtitle')}</p>
          <ButtonLink href="/contact" className="shrink-0">
            {tc('primary')}
          </ButtonLink>
        </Card>
      </Container>
    </article>
  );
}
