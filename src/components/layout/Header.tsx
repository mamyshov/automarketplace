import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { t } from "@/lib/i18n";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { HeaderAuthButton } from "@/components/layout/HeaderAuthButton";

const NAV_LINKS = [
  { href: "/cars", label: t.nav.catalog },
  { href: "/china/calculator", label: t.nav.calculator },
  { href: "/budget", label: t.nav.budget },
  { href: "/china", label: t.nav.china },
  { href: "/companies", label: t.nav.companies },
  { href: "/about", label: t.nav.about },
];

// Deliberately a plain (non-async) component with no server-side auth check
// — see HeaderAuthButton for why. This renders on every page via the root
// layout, so keeping it free of cookies()/data fetching is what lets public
// pages actually be cached (ISR) instead of hitting Supabase on every request.
export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-brand-600">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white"
            aria-hidden
          >
            🚗
          </span>
          {SITE_NAME}
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-700 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-brand-600">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <HeaderAuthButton />
        </div>
      </div>
    </header>
  );
}
