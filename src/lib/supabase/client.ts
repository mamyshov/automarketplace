"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

// Browser client — uses the anon key, subject to RLS. Safe to import from
// any "use client" component.
export function createClient() {
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
