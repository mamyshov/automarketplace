"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Plan } from "@/types/database";

export async function requestPlanUpgrade(plan: Plan): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Требуется вход" };

  const { error } = await supabase.from("subscriptions").insert({
    user_id: user.id,
    plan,
    status: "pending",
  });

  if (error) {
    console.error("requestPlanUpgrade failed", error);
    return { ok: false, error: "Не удалось отправить заявку" };
  }

  revalidatePath("/dashboard/billing");
  return { ok: true };
}
