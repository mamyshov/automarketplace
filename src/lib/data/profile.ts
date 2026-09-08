import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UserRow } from "@/types/database";
import type { User } from "@supabase/supabase-js";

export interface CurrentUser {
  authId: string;
  email: string | null;
  profile: UserRow;
}

/**
 * `supabase.auth.getUser()` is a network round-trip (it validates the JWT
 * against the Supabase Auth server, unlike the cookie-only `getSession()`).
 * Every page render ends up calling it several times independently — Header
 * (every page), the dashboard/admin layout, and often the page itself — and
 * those add up to a very slow-feeling app. `cache()` dedupes all of those
 * into a single actual request per page render (React Server Components
 * only — it does NOT cache across requests/users, so this stays as fresh
 * and secure as calling it directly).
 */
export const getAuthUser = cache(async (): Promise<User | null> => {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = createServerSupabaseClient();
  const { data: profile, error } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle();
  if (error || !profile) {
    if (error) console.error("getCurrentUser profile lookup failed", error);
    return null;
  }

  return { authId: user.id, email: user.email ?? null, profile: profile as UserRow };
});
