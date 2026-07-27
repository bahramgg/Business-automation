import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ServiceDetail } from '@/components/sections/service-detail';
import dynamic from 'next/dynamic';

const AuditScan = dynamic(() =>
  import('@/components/tools/audit-scan').then((m) => m.AuditScan),
);
import { serviceMetadata } from '@/lib/service-meta';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  return serviceMetadata('website', locale);
}

export default async function WebsiteServicePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  return <ServiceDetail slug="website" tool={<AuditScan />} />;
}
