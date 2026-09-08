import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/data/profile";
import type { DealerRow } from "@/types/database";

export interface DealerCardData extends DealerRow {
  listingCount: number;
}

export async function getDealers(): Promise<DealerCardData[]> {
  const supabase = createServerSupabaseClient();

  // One query per dealer for its listing count used to fire N simultaneous
  // requests — fine for a handful of dealers, not for a real catalog. A
  // single listings query (dealer_id only) plus a client-side tally scales
  // to one round-trip regardless of how many dealers there are.
  const [{ data, error }, { data: listingRows }] = await Promise.all([
    supabase.from("dealers").select("*").order("verified", { ascending: false }).order("rating", { ascending: false }),
    supabase
      .from("listings")
      .select("dealer_id")
      .eq("moderation_status", "approved")
      .neq("status", "sold")
      .not("dealer_id", "is", null),
  ]);

  if (error || !data) {
    if (error) console.error("getDealers failed", error);
    return [];
  }

  const counts = new Map<string, number>();
  for (const row of listingRows ?? []) {
    if (!row.dealer_id) continue;
    counts.set(row.dealer_id, (counts.get(row.dealer_id) ?? 0) + 1);
  }

  return (data as DealerRow[]).map((d) => ({ ...d, listingCount: counts.get(d.id) ?? 0 }));
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
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("dealers").select("*").eq("user_id", user.id).maybeSingle();
  if (error || !data) {
    if (error) console.error("getOwnDealer failed", error);
    return null;
  }
  return data as DealerRow;
}
