import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { StaticPageRow } from "@/types/database";
import { DEFAULT_LOCALE } from "@/lib/i18n";

export async function getStaticPage(slug: string, locale: string = DEFAULT_LOCALE): Promise<StaticPageRow | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("static_pages")
    .select("*")
    .eq("slug", slug)
    .eq("locale", locale)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getStaticPage failed", error);
    return null;
  }
  return data as StaticPageRow;
}

export async function listStaticPages(locale: string = DEFAULT_LOCALE): Promise<StaticPageRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("static_pages")
    .select("*")
    .eq("locale", locale)
    .order("slug");

  if (error) {
    console.error("listStaticPages failed", error);
    return [];
  }
  return data as StaticPageRow[];
}
