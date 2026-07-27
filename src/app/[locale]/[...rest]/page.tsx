import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

// Any unknown path under a locale falls through to the localized 404. Setting
// the request locale first gives not-found.tsx its message context at build.
export default async function CatchAll(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  notFound();
}
