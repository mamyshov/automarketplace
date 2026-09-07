import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SITE_NAME } from "@/lib/constants";
import { t } from "@/lib/i18n";

const NAV_LINKS = [
  { href: "/cars", label: t.nav.catalog },
  { href: "/china/calculator", label: "Калькулятор Китай" },
  { href: "/budget", label: "Подбор по бюджету" },
  { href: "/china", label: t.nav.china },
  { href: "/about", label: t.nav.about },
];

export async function Header() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {t.nav.dashboard}
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 hover:border-brand-600 hover:text-brand-600"
            >
              {t.nav.login}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
