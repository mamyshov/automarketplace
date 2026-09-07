import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Service-role client — bypasses RLS entirely. Server-only (the `server-only`
// import throws a build error if this is ever pulled into a client bundle).
// Use narrowly: admin moderation actions, lead-notification lookups, seed
// scripts. Everything else should go through the RLS-scoped clients.
export function createAdminSupabaseClient() {
  if (!env.supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
