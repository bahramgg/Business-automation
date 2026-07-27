import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ServiceDetail } from '@/components/sections/service-detail';
import dynamic from 'next/dynamic';

const LiveDemo = dynamic(() =>
  import('@/components/tools/live-demo').then((m) => m.LiveDemo),
);
import { serviceMetadata } from '@/lib/service-meta';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  return serviceMetadata('assistant', locale);
}

export default async function AssistantServicePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  return <ServiceDetail slug="assistant" tool={<LiveDemo />} />;
}
