import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/sections/hero';
import { Problem } from '@/components/sections/problem';
import { StartTool } from '@/components/sections/start-tool';
import { ServicesMap } from '@/components/sections/services-map';
import { Faq } from '@/components/sections/faq';
import { FinalCta } from '@/components/sections/final-cta';

// Home (plan §4): hero → problem → start tool (the one tool on home) →
// services map → FAQ → closing CTA.
export default async function HomePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Problem />
      <StartTool />
      <ServicesMap />
      <Faq />
      <FinalCta />
    </>
  );
}
