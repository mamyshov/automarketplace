"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { t } from "@/lib/i18n";

/**
 * Split out of Header so the header (and everything under the root layout)
 * doesn't need `cookies()` just to know whether to show "Войти" or
 * "Кабинет" — that single server-side auth check was forcing literally
 * every page on the site into fully dynamic rendering, with no caching at
 * all. Reading the session client-side (from the browser client's own
 * storage — no network round-trip in the common case) keeps the rest of
 * the page cacheable. Trade-off: a brief neutral placeholder while this
 * mounts, instead of the right CTA on the very first paint.
 */
export function HeaderAuthButton() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  if (loggedIn === null) {
    return <span className="inline-block h-9 w-[92px] animate-pulse rounded-full bg-neutral-100" aria-hidden />;
  }

  return loggedIn ? (
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
  );
}
