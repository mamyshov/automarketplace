"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ListingCardData } from "@/components/ui/ListingCard";
import type { ListingRow, ListingPhotoRow } from "@/types/database";

type CardRow = Pick<
  ListingRow,
  | "id"
  | "market"
  | "brand"
  | "model"
  | "year"
  | "mileage"
  | "price_origin"
  | "price_final"
  | "status"
  | "is_verified"
  | "is_top"
  | "location"
> & { listing_photos: Pick<ListingPhotoRow, "url" | "position">[] };

export async function getListingsByIds(ids: string[]): Promise<ListingCardData[]> {
  if (ids.length === 0) return [];

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, market, brand, model, year, mileage, price_origin, price_final, status, is_verified, is_top, location, listing_photos(url, position)"
    )
    .in("id", ids);

  if (error || !data) return [];

  return (data as unknown as CardRow[]).map((row) => {
    const photo = [...row.listing_photos].sort((a, b) => a.position - b.position)[0];
    return { ...row, photo_url: photo?.url ?? null };
  });
}
