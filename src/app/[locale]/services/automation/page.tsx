import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ServiceDetail } from '@/components/sections/service-detail';
import dynamic from 'next/dynamic';

const RepeatCalculator = dynamic(() =>
  import('@/components/tools/repeat-calculator').then((m) => m.RepeatCalculator),
);
import { serviceMetadata } from '@/lib/service-meta';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  return serviceMetadata('automation', locale);
}

export default async function AutomationServicePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  return <ServiceDetail slug="automation" tool={<RepeatCalculator />} />;
}
