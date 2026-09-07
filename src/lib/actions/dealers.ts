"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { dealerFormSchema, type DealerFormInput } from "@/lib/validation";

export interface DealerActionResult {
  ok: boolean;
  slug?: string;
  error?: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "company";
}

async function uniqueSlug(supabase: ReturnType<typeof createServerSupabaseClient>, base: string, excludeId?: string) {
  let slug = slugify(base);
  let suffix = 0;

  // Small bounded loop — dealer count is low on MVP scale, this never
  // realistically iterates more than once or twice.
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    let query = supabase.from("dealers").select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    suffix += 1;
  }
}

export async function upsertOwnDealer(input: DealerFormInput): Promise<DealerActionResult> {
  const parsed = dealerFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" };

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Требуется вход" };

  const { data: existing } = await supabase.from("dealers").select("id, slug").eq("user_id", user.id).maybeSingle();

  if (existing) {
    const { error } = await supabase.from("dealers").update({ ...parsed.data, updated_at: new Date().toISOString() }).eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/dashboard/company");
    revalidatePath(`/companies/${existing.slug}`);
    return { ok: true, slug: existing.slug };
  }

  const slug = await uniqueSlug(supabase, parsed.data.name);
  const { data, error } = await supabase
    .from("dealers")
    .insert({ ...parsed.data, user_id: user.id, slug })
    .select("slug")
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? "Не удалось создать профиль компании" };

  revalidatePath("/dashboard/company");
  revalidatePath("/companies");
  return { ok: true, slug: data.slug };
}

export async function setOwnDealerLogo(logoUrl: string): Promise<DealerActionResult> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Требуется вход" };

  const { error } = await supabase.from("dealers").update({ logo_url: logoUrl }).eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/company");
  return { ok: true };
}
