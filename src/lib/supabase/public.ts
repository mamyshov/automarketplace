import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Anon-key client that does NOT read cookies() — for Server Components
// fetching data any anonymous visitor can already read via RLS (approved
// listings, dealers, brands, static pages, active banners, reviews).
//
// createServerSupabaseClient() calls cookies(), and Next.js treats that as
// an opt-out of caching for the *entire* route — every page ends up
// server-rendered from scratch on every single request, even ones that
// don't need auth at all. Using this client instead lets those pages carry
// `export const revalidate = …` and actually be cached (ISR) rather than
// re-querying Supabase on every navigation, which is the main reason the
// app can feel slow regardless of how few queries a page makes.
//
// Never use this where the query result depends on *who's* asking (RLS
// self/owner/admin policies) — those need createServerSupabaseClient().
export function createPublicSupabaseClient() {
  // Unlike @supabase/ssr's createServerClient (used by
  // createServerSupabaseClient), the plain supabase-js createClient throws
  // synchronously on an empty URL — which would crash the whole build the
  // moment ISR tries to statically pre-render one of these pages without
  // env vars configured (a bare checkout, a misconfigured CI). Falling back
  // to a syntactically valid placeholder keeps construction safe; an actual
  // query against it just fails as a normal fetch error, which every caller
  // here already handles (`if (error) { console.error(...); return [] }`).
  return createClient(env.supabaseUrl || "https://placeholder.invalid", env.supabaseAnonKey || "placeholder-anon-key", {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
