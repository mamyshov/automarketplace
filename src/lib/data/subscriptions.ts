import type { createServerSupabaseClient } from "@/lib/supabase/server";
import { FREE_LISTING_LIMIT, PRO_LISTING_LIMIT } from "@/lib/constants";
import type { Plan } from "@/types/database";

/**
 * Every plan currently in force for this account (spec §5.7): the user's
 * own personal subscription, plus any active subscription on a dealer
 * profile they own — either counts, since both make the account operate
 * as that plan. 'top' subscriptions are included too but are meaningless
 * here (they're a one-off per-listing promotion, not account-wide) — the
 * callers below simply never look for 'top' in the returned list.
 */
export async function getActivePlans(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string
): Promise<Plan[]> {
  const nowIso = new Date().toISOString();

  const { data: personalSubs } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .is("dealer_id", null)
    .eq("status", "active")
    .gte("expires_at", nowIso);

  const { data: dealer } = await supabase.from("dealers").select("id").eq("user_id", userId).maybeSingle();

  let dealerSubs: { plan: Plan }[] | null = null;
  if (dealer) {
    const { data } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("dealer_id", dealer.id)
      .eq("status", "active")
      .gte("expires_at", nowIso);
    dealerSubs = data;
  }

  return [...(personalSubs ?? []), ...(dealerSubs ?? [])].map((s) => s.plan);
}

/**
 * Active-listing cap for this user (spec §5.7): free=5, pro=30,
 * dealer=unlimited (null).
 */
export async function getListingLimit(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string
): Promise<number | null> {
  const plans = await getActivePlans(supabase, userId);
  if (plans.includes("dealer")) return null;
  if (plans.includes("pro")) return PRO_LISTING_LIMIT;
  return FREE_LISTING_LIMIT;
}

/**
 * "Статистика" (PRO) / "Аналитика" (Дилер) privilege (spec §5.7) — the
 * free plan doesn't get the seller stats page.
 */
export async function hasStatsAccess(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string
): Promise<boolean> {
  const plans = await getActivePlans(supabase, userId);
  return plans.includes("pro") || plans.includes("dealer");
}
