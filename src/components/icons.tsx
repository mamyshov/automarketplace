// Small hand-rolled icon set (no external icon library dependency — keeps
// the bundle CDN-free per the artifact/runtime constraints this project was
// scaffolded under, and there's no reason to add a dependency for a dozen
// glyphs). Each icon accepts standard SVG props via className.

import type { SVGProps } from "react";

function base(props: SVGProps<SVGSVGElement>) {
  return { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, ...props };
}

export function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function CarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M3 13.5 5 8a2 2 0 0 1 2-1.4h10A2 2 0 0 1 19 8l2 5.5" />
      <rect x="2.5" y="13.5" width="19" height="5.5" rx="1.5" />
      <circle cx="7" cy="19.5" r="1.5" />
      <circle cx="17" cy="19.5" r="1.5" />
    </svg>
  );
}

export function CalculatorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="2.5" width="16" height="19" rx="2" />
      <path d="M8 6.5h8M7 11h.01M12 11h.01M17 11h.01M7 15h.01M12 15h.01M17 15v4M7 19h.01M12 19h.01" />
    </svg>
  );
}

export function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M12 20s-7-4.35-9.5-8.5C.7 8.2 2.2 5 5.5 5c2 0 3.4 1.2 4.5 2.7C11.1 6.2 12.5 5 14.5 5 17.8 5 19.3 8.2 21.5 11.5 19 15.65 12 20 12 20Z" />
    </svg>
  );
}

export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function FilterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function CheckBadgeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="m9 12 2 2 4-4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} strokeWidth={1.5}>
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8.4 19L4 20Z" />
      <path d="M8.5 9.5c.2 2.6 2.4 4.8 5 5 .8 0 .9-.6.9-1.1 0-.4-.2-.6-.5-.7l-1.4-.6c-.3-.1-.5 0-.7.2l-.4.5a5 5 0 0 1-2.3-2.3l.5-.4c.2-.2.3-.4.2-.7l-.6-1.4c-.1-.3-.3-.5-.7-.5-.5 0-1.1.1-1 .9Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
