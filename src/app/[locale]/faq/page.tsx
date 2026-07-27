import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/seo';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Faq } from '@/components/sections/faq';
import { FinalCta } from '@/components/sections/final-cta';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Faq' });
  return {
    title: t('title'),
    description: t('items.prices.a'),
    alternates: localeAlternates(locale, '/faq'),
  };
}

// /faq — the same FAQ section as the home page, with its FAQPage schema
// (plan §3, §14). One source of questions, two placements.
export default async function FaqPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  return (
    <>
      <Faq />
      <FinalCta />
    </>
  );
}
