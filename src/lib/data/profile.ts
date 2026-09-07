import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UserRow } from "@/types/database";

export interface CurrentUser {
  authId: string;
  email: string | null;
  profile: UserRow;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle();
  if (error || !profile) {
    if (error) console.error("getCurrentUser profile lookup failed", error);
    return null;
  }

  return { authId: user.id, email: user.email ?? null, profile: profile as UserRow };
}
