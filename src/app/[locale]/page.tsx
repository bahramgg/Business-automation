import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/sections/hero';
import { Problem } from '@/components/sections/problem';
import { StartTool } from '@/components/sections/start-tool';
import { ServicesMap } from '@/components/sections/services-map';
import { Timeline } from '@/components/sections/timeline';
import { Faq } from '@/components/sections/faq';
import { FinalCta } from '@/components/sections/final-cta';
import { Reveal } from '@/components/ui/reveal';

// Home (plan §4): hero → problem → start tool (the one tool on home) →
// services map → timeline → FAQ → closing CTA.
export default async function HomePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      {/* Hero is above the fold — never delayed. */}
      <Hero />
      <Reveal><Problem /></Reveal>
      <Reveal delayMs={60}><StartTool /></Reveal>
      <Reveal><ServicesMap /></Reveal>
      <Reveal delayMs={60}><Timeline /></Reveal>
      <Reveal><Faq /></Reveal>
      <Reveal delayMs={60}><FinalCta /></Reveal>
    </>
  );
}
