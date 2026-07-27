import type { SVGProps } from 'react';

// Minimal line icons (stroke = currentColor). Kept inline so there's no icon
// font or external asset (plan §10). 24×24 grid, 1.6 stroke.
type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconMessage(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a8.5 8.5 0 0 1-.9-4A8.38 8.38 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5Z" />
    </Base>
  );
}

export function IconGrid(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 17.5h7M17.5 14v7" />
    </Base>
  );
}

export function IconReturn(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 4v4h4" />
    </Base>
  );
}

export function IconStore(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 9V7l1.5-3h13L20 7v2a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-6 0 2.5 2.5 0 0 1-5 0Z" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M9.5 20v-5h5v5" />
    </Base>
  );
}

export function IconBot(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="4" y="8" width="16" height="11" rx="3" />
      <path d="M12 8V4M8 3.5h8" />
      <circle cx="9" cy="13" r="1" />
      <circle cx="15" cy="13" r="1" />
    </Base>
  );
}

export function IconAutomation(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      <circle cx="12" cy="12" r="3.2" />
    </Base>
  );
}

export function IconSpark(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3Z" />
    </Base>
  );
}

export function IconArrow(props: IconProps) {
  // Points toward the inline-end; flipped for RTL via the caller's dir.
  return (
    <Base {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Base>
  );
}
