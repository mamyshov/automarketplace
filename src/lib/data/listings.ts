import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { ListingRow, ListingPhotoRow, ListingVideoRow, DealerRow } from "@/types/database";
import type { ListingCardData } from "@/components/ui/ListingCard";
import type { CatalogFilters } from "@/components/ui/FilterPanel";

const CARD_SELECT =
  "id, market, brand, model, year, mileage, price_origin, price_final, status, is_verified, is_top, location, listing_photos(url, position)";

type CardRow = Pick<
  ListingRow,
  "id" | "market" | "brand" | "model" | "year" | "mileage" | "price_origin" | "price_final" | "status" | "is_verified" | "is_top" | "location"
> & { listing_photos: Pick<ListingPhotoRow, "url" | "position">[] };

function toCard(row: CardRow): ListingCardData {
  const photo = [...row.listing_photos].sort((a, b) => a.position - b.position)[0];
  return { ...row, photo_url: photo?.url ?? null };
}

export async function getFeaturedListings(market: "bishkek" | "china", limit = 4): Promise<ListingCardData[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("listings")
    .select(CARD_SELECT)
    .eq("market", market)
    .eq("moderation_status", "approved")
    .neq("status", "sold")
    .order("is_top", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getFeaturedListings failed", error);
    return [];
  }
  return (data as unknown as CardRow[]).map(toCard);
}

export async function getDealerListings(dealerId: string, limit = 60): Promise<ListingCardData[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("listings")
    .select(CARD_SELECT)
    .eq("dealer_id", dealerId)
    .eq("moderation_status", "approved")
    .neq("status", "sold")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getDealerListings failed", error);
    return [];
  }
  return (data as unknown as CardRow[]).map(toCard);
}

export interface CatalogPage {
  listings: ListingCardData[];
  count: number;
}

const PAGE_SIZE = 20;

export async function getCatalogListings(
  filters: Partial<CatalogFilters> & { mileageMax?: string; mileageMin?: string },
  page = 1
): Promise<CatalogPage> {
  const supabase = createPublicSupabaseClient();
  let query = supabase
    .from("listings")
    .select(CARD_SELECT, { count: "exact" })
    .eq("moderation_status", "approved");

  if (filters.market) query = query.eq("market", filters.market);
  if (filters.brand) query = query.ilike("brand", `%${filters.brand}%`);
  if (filters.model) query = query.ilike("model", `%${filters.model}%`);
  if (filters.bodyType) query = query.eq("body_type", filters.bodyType);
  if (filters.transmission) query = query.eq("transmission", filters.transmission);
  if (filters.fuel) query = query.eq("fuel", filters.fuel);
  if (filters.status) {
    query = query.eq("status", filters.status);
  } else {
    query = query.neq("status", "sold");
  }
  if (filters.yearFrom) query = query.gte("year", Number(filters.yearFrom));
  if (filters.yearTo) query = query.lte("year", Number(filters.yearTo));
  if (filters.priceFrom) query = query.gte("price_final", Number(filters.priceFrom));
  if (filters.priceTo) query = query.lte("price_final", Number(filters.priceTo));
  if (filters.mileageMax) query = query.lte("mileage", Number(filters.mileageMax));
  if (filters.mileageMin) query = query.gte("mileage", Number(filters.mileageMin));

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  // TOP listings (spec §5.7 — paid one-off promotion) sort first, spec's
  // "поднятие в поиске".
  query = query.order("is_top", { ascending: false }).order("created_at", { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) {
    console.error("getCatalogListings failed", error);
    return { listings: [], count: 0 };
  }
  return { listings: (data as unknown as CardRow[]).map(toCard), count: count ?? 0 };
}

export async function getBudgetMatches(budget: number, limit = 12): Promise<ListingCardData[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("listings")
    .select(CARD_SELECT)
    .eq("market", "china")
    .eq("moderation_status", "approved")
    .neq("status", "sold")
    .lte("price_final", budget * 1.15)
    .order("price_final", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getBudgetMatches failed", error);
    return [];
  }

  return (data as unknown as CardRow[])
    .map(toCard)
    .sort((a, b) => Math.abs(a.price_final - budget) - Math.abs(b.price_final - budget));
}

export interface ListingDetail extends ListingRow {
  listing_photos: ListingPhotoRow[];
  listing_videos: ListingVideoRow[];
  dealers: Pick<DealerRow, "id" | "name" | "slug" | "verified" | "phone" | "whatsapp" | "telegram"> | null;
}

export async function getListingById(id: string): Promise<ListingDetail | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "*, listing_photos(*), listing_videos(*), dealers(id, name, slug, verified, phone, whatsapp, telegram)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getListingById failed", error);
    return null;
  }

  return data as unknown as ListingDetail;
}

export async function incrementListingViews(id: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  await supabase.rpc("increment_listing_views", { p_listing_id: id });
}
