"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Same trust model as lib/actions/admin.ts: these ride the caller's own
// RLS-scoped session — the "brands/models admin write" policies (0001_init.sql)
// are what actually authorize this, not a service-role bypass.

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9а-яё]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "brand"
  );
}

export interface BrandsActionResult {
  ok: boolean;
  error?: string;
}

export async function createBrand(name: string): Promise<BrandsActionResult> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Укажите название марки" };

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("brands").insert({ name: trimmed, slug: slugify(trimmed) });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/brands");
  return { ok: true };
}

export async function deleteBrand(id: string): Promise<BrandsActionResult> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/brands");
  return { ok: true };
}

export async function createModel(brandId: string, name: string): Promise<BrandsActionResult> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Укажите название модели" };

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("models")
    .insert({ brand_id: brandId, name: trimmed, slug: slugify(trimmed) });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/brands");
  return { ok: true };
}

export async function deleteModel(id: string): Promise<BrandsActionResult> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("models").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/brands");
  return { ok: true };
}
