import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { ToolBlock } from '@/components/tools/tool-block';
import { RoiCalculator } from '@/components/tools/roi-calculator';

// The one tool on the home page (plan §4.3): the lost-sales calculator in its
// compact role, inside the standard tool block. The full version + assumptions
// live at /tools/roi (canonical), which the block links to.
export function StartTool() {
  const t = useTranslations('Roi');

  return (
    <section className="py-16 sm:py-20">
      <SectionHeading
        eyebrow={t('eyebrow')}
        title={t('title')}
        subtitle={t('subtitle')}
      />
      <Container className="mt-10">
        <ToolBlock fullHref="/tools/roi">
          <RoiCalculator variant="compact" />
        </ToolBlock>
      </Container>
    </section>
  );
}
