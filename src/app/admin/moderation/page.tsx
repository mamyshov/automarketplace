import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ModerationActions } from "./ModerationActions";
import type { ListingRow } from "@/types/database";

export const metadata: Metadata = { title: "Модерация объявлений" };

const MODERATION_LABELS: Record<string, string> = { pending: "На проверке", approved: "Опубликовано", rejected: "Отклонено" };

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const filter = searchParams.status ?? "pending";
  const supabase = createServerSupabaseClient();

  let query = supabase.from("listings").select("*").order("created_at", { ascending: false });
  if (filter !== "all") query = query.eq("moderation_status", filter);

  const { data } = await query;
  const listings = (data ?? []) as ListingRow[];

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-neutral-900">Модерация объявлений</h1>

      <div className="mb-4 flex gap-2">
        {["pending", "approved", "rejected", "all"].map((s) => (
          <Link
            key={s}
            href={`/admin/moderation?status=${s}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              filter === s ? "bg-neutral-900 text-white" : "border border-neutral-300 text-neutral-700"
            }`}
          >
            {s === "all" ? "Все" : MODERATION_LABELS[s]}
          </Link>
        ))}
      </div>

      {listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          Нет объявлений в этой категории.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {listings.map((listing) => (
            <div key={listing.id} className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href={`/listings/${listing.id}`} className="font-semibold text-neutral-900 hover:text-brand-600">
                  {listing.brand} {listing.model}, {listing.year}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                  <StatusBadge status={listing.status} />
                  <span>{MODERATION_LABELS[listing.moderation_status]}</span>
                  <span>${new Intl.NumberFormat("en-US").format(listing.price_final)}</span>
                  {listing.is_verified && <span className="text-success">✅ Проверено</span>}
                </div>
              </div>
              <ModerationActions listingId={listing.id} isVerified={listing.is_verified} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
