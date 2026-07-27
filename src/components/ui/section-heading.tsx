import { Container } from './container';

// Consistent section header: a small eyebrow label, an h2, and an optional
// lead line. No gradient text here — the one gradient phrase per page lives in
// the hero (plan §2).
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'start';
}) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-start';
  return (
    <Container>
      <div className={`${alignment} max-w-2xl`}>
        <span className="text-xs font-semibold uppercase tracking-widest text-dim">
          {eyebrow}
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-4 text-base leading-relaxed text-muted">{subtitle}</p>
        ) : null}
      </div>
    </Container>
  );
}
