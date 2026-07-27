import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/sections/hero';
import { Service } from '@/components/sections/service';
import { Benefits } from '@/components/sections/benefits';
import { Impact } from '@/components/sections/impact';
import { Contact } from '@/components/sections/contact';

// The whole site is this page: what the service is, what it changes, one tool
// that puts a number on it, and the form. Nothing else to navigate.
export default async function HomePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Service />
      <Benefits />
      <Impact />
      <Contact />
    </>
  );
}
