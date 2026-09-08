import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { ReviewRow } from "@/types/database";

export async function getDealerReviews(dealerId: string): Promise<ReviewRow[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("dealer_id", dealerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getDealerReviews failed", error);
    return [];
  }
  return data as ReviewRow[];
}

export interface ReviewWithDealer extends ReviewRow {
  dealers: { name: string; slug: string } | null;
}

export async function getAllReviews(): Promise<ReviewWithDealer[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, dealers(name, slug)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("getAllReviews failed", error);
    return [];
  }
  return data as unknown as ReviewWithDealer[];
}
