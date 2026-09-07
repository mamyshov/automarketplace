import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DealerRow } from "@/types/database";

export interface DealerCardData extends DealerRow {
  listingCount: number;
}

export async function getDealers(): Promise<DealerCardData[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("dealers").select("*").order("verified", { ascending: false }).order("rating", { ascending: false });

  if (error || !data) {
    if (error) console.error("getDealers failed", error);
    return [];
  }

  const dealers = data as DealerRow[];
  const counts = await Promise.all(
    dealers.map((d) =>
      supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("dealer_id", d.id)
        .eq("moderation_status", "approved")
        .neq("status", "sold")
    )
  );

  return dealers.map((d, i) => ({ ...d, listingCount: counts[i].count ?? 0 }));
}

export async function getDealerBySlug(slug: string): Promise<DealerRow | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("dealers").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) {
    if (error) console.error("getDealerBySlug failed", error);
    return null;
  }
  return data as DealerRow;
}

export async function getOwnDealer(): Promise<DealerRow | null> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from("dealers").select("*").eq("user_id", user.id).maybeSingle();
  if (error || !data) {
    if (error) console.error("getOwnDealer failed", error);
    return null;
  }
  return data as DealerRow;
}
