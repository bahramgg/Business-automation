import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/sections/hero';
import { Problem } from '@/components/sections/problem';
import { ServicesMap } from '@/components/sections/services-map';
import { Faq } from '@/components/sections/faq';
import { FinalCta } from '@/components/sections/final-cta';

// Home (plan §4). Phase 2 adds the problem cards, the services map, a short
// FAQ, and the closing CTA. The start tool (ROI calculator) is intentionally
// absent until Phase 3 — one tool on home, and not yet.
export default async function HomePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Problem />
      <ServicesMap />
      <Faq />
      <FinalCta />
    </>
  );
}
