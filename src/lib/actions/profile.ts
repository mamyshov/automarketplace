"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface ProfileInput {
  name: string;
  phone: string;
  whatsapp: string;
  telegram: string;
}

export async function updateProfile(input: ProfileInput): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Требуется вход" };

  const { error } = await supabase
    .from("users")
    .update({
      name: input.name || null,
      phone: input.phone || null,
      whatsapp: input.whatsapp || null,
      telegram: input.telegram || null,
    })
    .eq("id", user.id);

  if (error) {
    console.error("updateProfile failed", error);
    return { ok: false, error: "Не удалось сохранить профиль" };
  }

  revalidatePath("/dashboard/settings");
  return { ok: true };
}
