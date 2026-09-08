"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Plan } from "@/types/database";

export async function requestPlanUpgrade(
  plan: Plan,
  listingId?: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Требуется вход" };

  // 'top' is a one-off per-listing promotion (spec §5.7), not an
  // account-wide plan — it must name the listing being promoted. The RLS
  // policy (owns_listing_or_null) re-checks ownership server-side too.
  if (plan === "top" && !listingId) {
    return { ok: false, error: "Не выбрано объявление для продвижения" };
  }

  const { error } = await supabase.from("subscriptions").insert({
    user_id: user.id,
    plan,
    status: "pending",
    listing_id: plan === "top" ? listingId : null,
  });

  if (error) {
    console.error("requestPlanUpgrade failed", error);
    return { ok: false, error: "Не удалось отправить заявку" };
  }

  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard/listings");
  return { ok: true };
}
