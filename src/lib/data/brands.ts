import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { BrandRow, ModelRow } from "@/types/database";

export interface BrandWithModels extends BrandRow {
  models: ModelRow[];
}

// Pure reference data (autocomplete for the listing form + catalog filter),
// admin-edited rarely — cached across requests with next/cache rather than
// re-fetched on every /cars load (a route that can't itself be ISR'd, since
// its filters live in searchParams). "brands" tag lets the admin CRUD
// actions (src/lib/actions/brands.ts) invalidate it immediately on write
// instead of waiting out the 5-minute revalidate.
export const getBrandsWithModels = unstable_cache(
  async (): Promise<BrandWithModels[]> => {
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
  },
  ["brands-with-models"],
  { revalidate: 300, tags: ["brands"] }
);
