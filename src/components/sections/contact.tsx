import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { LeadForm } from '@/components/tools/lead-form';

// The form, at the end. Anyone who wants to talk fills it in here; nothing
// earlier on the page asks for details.
export function Contact() {
  const t = useTranslations('Contact');

  return (
    <section id="contact" className="scroll-mt-24 border-t border-border py-16 sm:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="max-w-md">
            <p className="text-xs uppercase tracking-wider text-dim">{t('eyebrow')}</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {t('title')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">{t('subtitle')}</p>
          </div>

          <div>
            <h3 className="sr-only">{t('formTitle')}</h3>
            <LeadForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
