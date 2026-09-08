import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { BannerRow, BannerPlacement } from "@/types/database";

/**
 * The banner ad-slot backing AdBanner (spec's 5th monetization tier — "TOP"
 * is analogous, but boosts a listing rather than showing a site-wide ad).
 * One slot per placement: the most recently activated banner wins, no
 * rotation. `expires_at is null` is treated as "doesn't expire" (shouldn't
 * happen once an admin activates one — see updateBannerStatus — but kept
 * permissive rather than hiding a banner over a data gap).
 */
export async function getActiveBanner(placement: BannerPlacement): Promise<BannerRow | null> {
  const supabase = createPublicSupabaseClient();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("placement", placement)
    .eq("status", "active")
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getActiveBanner failed", error);
    return null;
  }
  return data as BannerRow | null;
}
