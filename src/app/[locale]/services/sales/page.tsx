import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import dynamic from 'next/dynamic';
import { ServiceDetail } from '@/components/sections/service-detail';
import { serviceMetadata } from '@/lib/service-meta';

// Split out of the initial bundle — the tool sits below the fold (plan §14).
const RoiCalculator = dynamic(() =>
  import('@/components/tools/roi-calculator').then((m) => m.RoiCalculator),
);

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  return serviceMetadata('sales', locale);
}

export default async function RoiDomainPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  return <ServiceDetail slug="sales" tool={<RoiCalculator />} />;
}
