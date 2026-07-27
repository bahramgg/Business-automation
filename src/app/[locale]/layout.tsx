import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, direction, isLocale, type Locale } from '@/i18n/routing';
import { pickClientMessages } from '@/i18n/client-namespaces';
import { siteUrl } from '@/lib/site';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import '@/styles/globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Meta' });
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `/${l}`]),
  );

  return {
    // Absolute base so per-page canonicals and alternates resolve to real URLs
    // in the emitted metadata (plan §14).
    metadataBase: new URL(siteUrl),
    title: {
      default: t('title'),
      template: `%s — AFA`,
    },
    description: t('description'),
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
    openGraph: {
      type: 'website',
      siteName: 'AFA',
      locale: locale === 'fa' ? 'fa_IR' : 'en_US',
      alternateLocale: locale === 'fa' ? 'en_US' : 'fa_IR',
      title: t('title'),
      description: t('description'),
      url: `/${locale}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
  };
}

export default async function LocaleLayout(props: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  if (!isLocale(locale)) {
    notFound();
  }
  // Enable static rendering for this locale.
  setRequestLocale(locale);

  const typedLocale: Locale = locale;
  // Only client-used namespaces cross to the browser (plan §14).
  const messages = pickClientMessages(await getMessages());
  const meta = await getTranslations({ locale, namespace: 'Meta' });
  const orgDescription = meta('description');

  return (
    <html lang={typedLocale} dir={direction[typedLocale]} suppressHydrationWarning>
      <head>
        {/* Preload only the weight the LCP heading uses, for the active locale
         * — the rest load on demand via font-display: swap (plan §14). */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href={typedLocale === 'fa' ? '/fonts/vazirmatn-800.woff2' : '/fonts/manrope-800.woff2'}
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {/* Organization schema (plan §14). Only facts we can stand behind. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'AFA',
              url: `${siteUrl}/${typedLocale}`,
              description: orgDescription,
            }),
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <a href="#main" className="sr-only focus:not-sr-only">
            Skip to content
          </a>
          <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <main id="main" className="flex-1">
              {props.children}
            </main>
            <SiteFooter />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
