"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { calculatorRateFormSchema, type CalculatorRateFormInput } from "@/lib/validation";
import type { ModerationStatus, LeadStatus, SubscriptionStatus } from "@/types/database";

// All admin write actions ride on the caller's own RLS-scoped session — the
// `public.is_admin()`-gated policies in the migration are what actually
// authorize these, not a service-role bypass. If the caller isn't an admin,
// Supabase returns a permission error and these functions surface it.

export async function moderateListing(id: string, status: ModerationStatus): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("listings").update({ moderation_status: status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/moderation");
  revalidatePath(`/listings/${id}`);
  return { ok: true };
}

export interface SetVerificationInput {
  verified: boolean;
  note?: string;
  byName?: string;
  /** ids of this listing's own photos to flag as diagnostic evidence in the
   * expandable "Проверенный автомобиль" block (spec §5.6) — everything else
   * on the listing is cleared back to false. */
  verificationPhotoIds?: string[];
  verificationVideoIds?: string[];
}

export async function setListingVerified(
  id: string,
  input: SetVerificationInput
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("listings")
    .update({
      is_verified: input.verified,
      verified_at: input.verified ? new Date().toISOString() : null,
      verified_note: input.note ?? null,
      verified_by_name: input.byName ?? null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  const photoIds = new Set(input.verificationPhotoIds ?? []);
  const videoIds = new Set(input.verificationVideoIds ?? []);

  const [{ data: photos }, { data: videos }] = await Promise.all([
    supabase.from("listing_photos").select("id, is_verification").eq("listing_id", id),
    supabase.from("listing_videos").select("id, is_verification").eq("listing_id", id),
  ]);

  const photoUpdates = (photos ?? [])
    .filter((p) => p.is_verification !== photoIds.has(p.id))
    .map((p) => supabase.from("listing_photos").update({ is_verification: photoIds.has(p.id) }).eq("id", p.id));
  const videoUpdates = (videos ?? [])
    .filter((v) => v.is_verification !== videoIds.has(v.id))
    .map((v) => supabase.from("listing_videos").update({ is_verification: videoIds.has(v.id) }).eq("id", v.id));

  await Promise.all([...photoUpdates, ...videoUpdates]);

  revalidatePath("/admin/moderation");
  revalidatePath(`/listings/${id}`);
  return { ok: true };
}

export async function upsertCalculatorRate(
  input: CalculatorRateFormInput,
  id?: string
): Promise<{ ok: boolean; error?: string }> {
  const parsed = calculatorRateFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" };

  const supabase = createServerSupabaseClient();
  const { error } = id
    ? await supabase.from("calculator_rates").update({ ...parsed.data, updated_at: new Date().toISOString() }).eq("id", id)
    : await supabase.from("calculator_rates").insert(parsed.data);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/rates");
  return { ok: true };
}

export async function deleteCalculatorRate(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("calculator_rates").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/rates");
  return { ok: true };
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/leads");
  return { ok: true };
}

export async function updateSubscriptionStatus(id: string, status: SubscriptionStatus): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServerSupabaseClient();
  const patch: Record<string, unknown> = { status };
  if (status === "active") {
    patch.started_at = new Date().toISOString();
    patch.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  }
  const { error } = await supabase.from("subscriptions").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/subscriptions");
  return { ok: true };
}

export async function upsertStaticPage(
  slug: string,
  locale: string,
  title: string,
  contentMd: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("static_pages")
    .upsert({ slug, locale, title, content_md: contentMd, updated_at: new Date().toISOString() }, { onConflict: "slug,locale" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/pages");
  revalidatePath(`/${slug}`);
  return { ok: true };
}
