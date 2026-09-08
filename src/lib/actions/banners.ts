"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { BannerPlacement } from "@/types/database";

export interface BannerActionResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export interface BannerRequestInput {
  title: string;
  linkUrl: string;
  imageUrl: string;
  placement: BannerPlacement;
}

export async function requestBanner(input: BannerRequestInput): Promise<BannerActionResult> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Требуется вход" };

  const title = input.title.trim();
  if (!title) return { ok: false, error: "Укажите название" };
  if (!input.imageUrl) return { ok: false, error: "Загрузите изображение баннера" };

  try {
    // eslint-disable-next-line no-new
    new URL(input.linkUrl);
  } catch {
    return { ok: false, error: "Некорректная ссылка (укажите полный адрес, например https://...)" };
  }

  const { data, error } = await supabase
    .from("banners")
    .insert({
      user_id: user.id,
      title,
      link_url: input.linkUrl,
      image_url: input.imageUrl,
      placement: input.placement,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("requestBanner failed", error);
    return { ok: false, error: "Не удалось отправить заявку" };
  }

  revalidatePath("/dashboard/ads");
  return { ok: true, id: data.id };
}
