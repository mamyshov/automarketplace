import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { env } from "@/lib/env";

// Refreshes the Supabase auth session cookie so Server Components/Actions
// on auth-sensitive routes see an up-to-date session (per @supabase/ssr's
// Next.js App Router recipe). Scoped to those routes only (see matcher
// below) — every request used to pass through here, which meant an Edge
// Function invocation + Supabase client + cookie parse on every single
// page view, including now-cacheable public pages that don't read cookies
// at all any more (Header's auth check moved client-side — see
// HeaderAuthButton). The browser Supabase client's own autoRefreshToken
// (on by default, and it mounts on every page via HeaderAuthButton) keeps
// the session cookie fresh for any Server Action a public page might still
// invoke (a review submission, say) even without middleware touching that
// route.
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  await supabase.auth.getSession();

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register", "/auth/:path*"],
};
