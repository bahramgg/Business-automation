import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/ui/section-heading';
import { ServiceCards } from './service-cards';

// Home "services map" section (plan §4.4): heading + the shared service cards.
export function ServicesMap() {
  const t = useTranslations('Services');

  return (
    <section className="py-16 sm:py-20">
      <SectionHeading
        eyebrow={t('eyebrow')}
        title={t('title')}
        subtitle={t('subtitle')}
      />
      <div className="mt-10">
        <ServiceCards />
      </div>
    </section>
  );
}
