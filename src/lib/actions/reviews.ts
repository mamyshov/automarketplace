"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface ReviewActionResult {
  ok: boolean;
  error?: string;
}

export async function createReview(
  dealerId: string,
  dealerSlug: string,
  author: string,
  rating: number,
  text: string
): Promise<ReviewActionResult> {
  const trimmedAuthor = author.trim();
  if (!trimmedAuthor) return { ok: false, error: "Укажите имя" };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Оценка должна быть от 1 до 5" };
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // RLS ("reviews insert authenticated") already requires auth.uid() is not
  // null — this check just gives a clearer error than a raw RLS denial.
  if (!user) return { ok: false, error: "Войдите, чтобы оставить отзыв" };

  const { error } = await supabase.from("reviews").insert({
    dealer_id: dealerId,
    author: trimmedAuthor,
    rating,
    text: text.trim() || null,
  });

  if (error) {
    console.error("createReview failed", error);
    return { ok: false, error: "Не удалось сохранить отзыв" };
  }

  revalidatePath(`/companies/${dealerSlug}`);
  revalidatePath(`/en/companies/${dealerSlug}`);
  revalidatePath("/companies");
  return { ok: true };
}

// Admin-only per RLS ("reviews admin delete") — used for spam moderation.
export async function deleteReview(id: string): Promise<ReviewActionResult> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/reviews");
  return { ok: true };
}
