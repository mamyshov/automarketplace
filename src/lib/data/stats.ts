import type { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ListingStatus, LeadStatus } from "@/types/database";

export interface SellerStats {
  totalActiveListings: number;
  totalViews: number;
  totalLeads: number;
  leadsByStatus: Record<LeadStatus, number>;
  leadsLast30Days: number;
  topListings: {
    id: string;
    brand: string;
    model: string;
    year: number;
    status: ListingStatus;
    is_top: boolean;
    views_count: number;
  }[];
}

const EMPTY_LEAD_COUNTS: Record<LeadStatus, number> = { new: 0, contacted: 0, closed: 0 };

/**
 * Backs the "Статистика"/"Аналитика" privilege (spec §5.7, PRO/Дилер only —
 * gated by hasStatsAccess() in the calling page, not here). RLS already
 * scopes both `listings` and `leads` to the caller's own rows, so these
 * queries need no extra `user_id`/`dealer_id` filtering beyond that.
 */
export async function getSellerStats(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string
): Promise<SellerStats> {
  const { data: listings } = await supabase
    .from("listings")
    .select("id, brand, model, year, status, is_top, views_count")
    .eq("user_id", userId)
    .order("views_count", { ascending: false });

  const rows = listings ?? [];
  const activeListings = rows.filter((l) => l.status !== "sold");
  const totalViews = rows.reduce((sum, l) => sum + (l.views_count ?? 0), 0);

  const { data: leads } = await supabase.from("leads").select("status, created_at");
  const leadRows = leads ?? [];

  const leadsByStatus = leadRows.reduce(
    (acc, lead) => {
      acc[lead.status as LeadStatus] = (acc[lead.status as LeadStatus] ?? 0) + 1;
      return acc;
    },
    { ...EMPTY_LEAD_COUNTS }
  );

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const leadsLast30Days = leadRows.filter((l) => new Date(l.created_at).getTime() >= thirtyDaysAgo).length;

  return {
    totalActiveListings: activeListings.length,
    totalViews,
    totalLeads: leadRows.length,
    leadsByStatus,
    leadsLast30Days,
    topListings: rows.slice(0, 10),
  };
}
