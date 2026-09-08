import type { createServerSupabaseClient } from "@/lib/supabase/server";
import { FREE_LISTING_LIMIT, PRO_LISTING_LIMIT } from "@/lib/constants";

/**
 * Active-listing cap for this user (spec §5.7): free=5, pro=30,
 * dealer=unlimited (null). "Dealer" unlimited applies both if the user's
 * own personal subscription is 'dealer' and if they own a dealer profile
 * with an active 'dealer' subscription on it — either way, that's the
 * account operating as a dealer. 'top' subscriptions never affect this:
 * that plan is a one-off per-listing promotion, not an account-wide cap.
 */
export async function getListingLimit(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string
): Promise<number | null> {
  const nowIso = new Date().toISOString();

  const { data: personalSubs } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .is("dealer_id", null)
    .eq("status", "active")
    .gte("expires_at", nowIso);

  const { data: dealer } = await supabase.from("dealers").select("id").eq("user_id", userId).maybeSingle();

  let dealerSubs: { plan: string }[] | null = null;
  if (dealer) {
    const { data } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("dealer_id", dealer.id)
      .eq("status", "active")
      .gte("expires_at", nowIso);
    dealerSubs = data;
  }

  const plans = [...(personalSubs ?? []), ...(dealerSubs ?? [])].map((s) => s.plan);
  if (plans.includes("dealer")) return null;
  if (plans.includes("pro")) return PRO_LISTING_LIMIT;
  return FREE_LISTING_LIMIT;
}
