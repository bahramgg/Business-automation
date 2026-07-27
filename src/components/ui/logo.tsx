// AFA wordmark — echoes the "AFA.CO" lockup in the reference, with the accent
// dot picked out in the brand violet. Kept as text (no image) for crispness
// and instant paint.
export function Logo({ label }: { label: string }) {
  return (
    <a
      href="#top"
      aria-label={label}
      className="group inline-flex items-center gap-2 text-lg font-extrabold tracking-tight text-ink"
    >
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-[10px] bg-brand text-[15px] font-extrabold text-white shadow-brand"
      >
        A
      </span>
      <span>
        AFA<span className="text-violet">.</span>
      </span>
    </a>
  );
}
