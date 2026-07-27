import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/sections/hero';
import { Service } from '@/components/sections/service';
import { Benefits } from '@/components/sections/benefits';
import { Work } from '@/components/sections/work';
import { Impact } from '@/components/sections/impact';
import { Contact } from '@/components/sections/contact';

// The whole site is this page: what the service is, what it changes, proof it
// works, one tool that puts a number on it, and the form. Proof sits before the
// tool so the estimate lands against something already shown to be real.
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
      <Work />
      <Impact />
      <Contact />
    </>
  );
}
