import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/sections/hero';

// Home. Phase 1 ships the hero + live-signal + CTAs; the problem cards,
// services map, tools, and FAQ arrive in Phase 2 (plan §16).
export default async function HomePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <Hero />;
}
