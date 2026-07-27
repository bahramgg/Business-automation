import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import dynamic from 'next/dynamic';
import { ServiceDetail } from '@/components/sections/service-detail';
import { serviceMetadata } from '@/lib/service-meta';

// Split out of the initial bundle — the tool sits below the fold (plan §14).
const AuditScan = dynamic(() =>
  import('@/components/tools/audit-scan').then((m) => m.AuditScan),
);

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  return serviceMetadata('acquisition', locale);
}

export default async function AuditDomainPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  return <ServiceDetail slug="acquisition" tool={<AuditScan />} />;
}
