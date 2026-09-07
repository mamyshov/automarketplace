"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { listingFormSchema, type ListingFormInput } from "@/lib/validation";
import { FREE_LISTING_LIMIT, MAX_PHOTOS_PER_LISTING } from "@/lib/constants";
import type { ListingStatus } from "@/types/database";

export interface ListingActionResult {
  ok: boolean;
  id?: string;
  error?: string;
}

// A listing's dealer_id is a claim of "this is company X's listing" — never
// trust it from the client as-is. Confirms the dealer row (if any) actually
// belongs to the calling user before it's allowed onto the listing.
async function assertOwnDealerOrNull(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string,
  dealerId: string | null | undefined
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!dealerId) return { ok: true };
  const { data } = await supabase.from("dealers").select("id").eq("id", dealerId).eq("user_id", userId).maybeSingle();
  if (!data) return { ok: false, error: "Эта компания вам не принадлежит" };
  return { ok: true };
}

export async function createListing(input: ListingFormInput): Promise<ListingActionResult> {
  const parsed = listingFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" };
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Требуется вход" };

  const dealerCheck = await assertOwnDealerOrNull(supabase, user.id, parsed.data.dealer_id);
  if (!dealerCheck.ok) return { ok: false, error: dealerCheck.error };

  // Free plan limit (spec §5.7) — dealers/PRO users are exempt via an active
  // subscription; MVP keeps this check simple (count of the user's own
  // non-sold listings vs. FREE_LISTING_LIMIT) rather than a full plan engine.
  const { count } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .neq("status", "sold");

  const { data: activeSub } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!activeSub && (count ?? 0) >= FREE_LISTING_LIMIT) {
    return {
      ok: false,
      error: `На бесплатном тарифе доступно не более ${FREE_LISTING_LIMIT} активных объявлений. Оформите тариф PRO/Дилер, чтобы разместить больше.`,
    };
  }

  const { data, error } = await supabase
    .from("listings")
    .insert({ ...parsed.data, user_id: user.id })
    .select("id")
    .single();

  if (error || !data) {
    console.error("createListing failed", error);
    return { ok: false, error: "Не удалось создать объявление" };
  }

  revalidatePath("/dashboard/listings");
  return { ok: true, id: data.id };
}

export async function updateListing(id: string, input: ListingFormInput): Promise<ListingActionResult> {
  const parsed = listingFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" };
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Требуется вход" };

  const dealerCheck = await assertOwnDealerOrNull(supabase, user.id, parsed.data.dealer_id);
  if (!dealerCheck.ok) return { ok: false, error: dealerCheck.error };

  const { error } = await supabase.from("listings").update(parsed.data).eq("id", id);

  if (error) {
    console.error("updateListing failed", error);
    return { ok: false, error: "Не удалось сохранить изменения" };
  }

  // A seller edit resets moderation to pending unless the platform trusts
  // pure status changes — kept simple here: any edit goes back to review.
  await supabase.from("listings").update({ moderation_status: "pending" }).eq("id", id);

  revalidatePath("/dashboard/listings");
  revalidatePath(`/listings/${id}`);
  return { ok: true, id };
}

export async function updateListingStatus(id: string, status: ListingStatus): Promise<ListingActionResult> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("listings").update({ status }).eq("id", id);
  if (error) {
    console.error("updateListingStatus failed", error);
    return { ok: false, error: "Не удалось изменить статус" };
  }
  revalidatePath("/dashboard/listings");
  revalidatePath(`/listings/${id}`);
  return { ok: true, id };
}

export async function deleteListing(id: string): Promise<ListingActionResult> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) {
    console.error("deleteListing failed", error);
    return { ok: false, error: "Не удалось удалить объявление" };
  }
  revalidatePath("/dashboard/listings");
  return { ok: true };
}

export async function addListingPhotos(listingId: string, urls: string[]): Promise<ListingActionResult> {
  const supabase = createServerSupabaseClient();

  const { count } = await supabase
    .from("listing_photos")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId);

  if ((count ?? 0) + urls.length > MAX_PHOTOS_PER_LISTING) {
    return { ok: false, error: `Максимум ${MAX_PHOTOS_PER_LISTING} фото на объявление` };
  }

  const rows = urls.map((url, i) => ({ listing_id: listingId, url, position: (count ?? 0) + i }));
  const { error } = await supabase.from("listing_photos").insert(rows);
  if (error) {
    console.error("addListingPhotos failed", error);
    return { ok: false, error: "Не удалось сохранить фото" };
  }
  revalidatePath(`/dashboard/listings/${listingId}/edit`);
  return { ok: true, id: listingId };
}

export async function deleteListingPhoto(photoId: string, listingId: string): Promise<ListingActionResult> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("listing_photos").delete().eq("id", photoId);
  if (error) {
    console.error("deleteListingPhoto failed", error);
    return { ok: false, error: "Не удалось удалить фото" };
  }
  revalidatePath(`/dashboard/listings/${listingId}/edit`);
  return { ok: true };
}
