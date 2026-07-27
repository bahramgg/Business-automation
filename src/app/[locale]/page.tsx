import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/sections/hero';
import { Path } from '@/components/sections/path';
import { Problem } from '@/components/sections/problem';
import { StartTool } from '@/components/sections/start-tool';
import { ServicesMap } from '@/components/sections/services-map';
import { Timeline } from '@/components/sections/timeline';
import { Faq } from '@/components/sections/faq';
import { FinalCta } from '@/components/sections/final-cta';

// Home, ordered as the visitor's path rather than as a catalogue:
// what we do → the three steps → why it matters → step one (assess) →
// the four domains → how delivery works → FAQ → the call.
//
// No scroll-reveal: it left every section below the fold at opacity 0 until an
// observer fired, so print, PDF, and any full-page capture came out blank. The
// section rhythm carries the page without it.
export default async function HomePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Path />
      <Problem />
      <StartTool />
      <ServicesMap />
      <Timeline />
      <Faq />
      <FinalCta />
    </>
  );
}
