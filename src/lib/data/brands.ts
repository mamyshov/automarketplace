import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { BrandRow, ModelRow } from "@/types/database";

export interface BrandWithModels extends BrandRow {
  models: ModelRow[];
}

export async function getBrandsWithModels(): Promise<BrandWithModels[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*, models(*)")
    .order("name");

  if (error) {
    console.error("getBrandsWithModels failed", error);
    return [];
  }

  return (data as (BrandRow & { models: ModelRow[] })[]).map((b) => ({
    ...b,
    models: [...b.models].sort((a, z) => a.name.localeCompare(z.name)),
  }));
}
