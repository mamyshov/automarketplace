import Link from "next/link";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatusSelect } from "./StatusSelect";
import { DeleteListingButton } from "./DeleteListingButton";
import { PromoteTopButton } from "./PromoteTopButton";
import { getListingLimit } from "@/lib/data/subscriptions";
import { getAuthUser } from "@/lib/data/profile";
import type { ListingRow, ListingPhotoRow } from "@/types/database";

export const metadata: Metadata = { title: "Мои объявления" };

const MODERATION_LABELS: Record<string, string> = {
  pending: "На проверке",
  approved: "Опубликовано",
  rejected: "Отклонено",
};

const MODERATION_CLASSES: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-danger/10 text-danger",
};

export default async function MyListingsPage() {
  const supabase = createServerSupabaseClient();
  const user = await getAuthUser();

  const [{ data }, limit] = await Promise.all([
    supabase
      .from("listings")
      .select("*, listing_photos(url, position)")
      .eq("user_id", user?.id ?? "")
      .order("created_at", { ascending: false }),
    user ? getListingLimit(supabase, user.id) : Promise.resolve(null),
  ]);

  const listings = (data ?? []) as (ListingRow & { listing_photos: Pick<ListingPhotoRow, "url" | "position">[] })[];

  const { data: pendingTopSubs } = await supabase
    .from("subscriptions")
    .select("listing_id")
    .eq("plan", "top")
    .eq("status", "pending")
    .in("listing_id", listings.map((l) => l.id).length ? listings.map((l) => l.id) : ["00000000-0000-0000-0000-000000000000"]);
  const pendingTopListingIds = new Set((pendingTopSubs ?? []).map((s) => s.listing_id));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">Мои объявления</h1>
        <Link
          href="/dashboard/listings/new"
          className="min-h-touch rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + Разместить объявление
        </Link>
      </div>

      <p className="mb-4 text-sm text-neutral-500">
        {listings.filter((l) => l.status !== "sold").length}
        {limit === null ? "" : `/${limit}`} активных объявлений
        {limit === null && " · тариф Дилер — без ограничений"}
      </p>

      {listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          У вас пока нет объявлений.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {listings.map((listing) => {
            const photo = [...listing.listing_photos].sort((a, b) => a.position - b.position)[0];
            return (
              <div key={listing.id} className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xl text-neutral-300">🚗</div>
                  )}
                </div>

                <div className="flex-1">
                  <Link href={`/listings/${listing.id}`} className="font-semibold text-neutral-900 hover:text-brand-600">
                    {listing.brand} {listing.model}, {listing.year}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <StatusBadge status={listing.status} />
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${MODERATION_CLASSES[listing.moderation_status]}`}>
                      {MODERATION_LABELS[listing.moderation_status]}
                    </span>
                    <span className="text-xs text-neutral-400">{listing.views_count} просмотров</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <PromoteTopButton
                    listingId={listing.id}
                    isTop={listing.is_top}
                    isPendingRequest={pendingTopListingIds.has(listing.id)}
                  />
                  <StatusSelect listingId={listing.id} initialStatus={listing.status} />
                  <Link
                    href={`/dashboard/listings/${listing.id}/edit`}
                    className="min-h-touch rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:border-brand-500"
                  >
                    Редактировать
                  </Link>
                  <DeleteListingButton listingId={listing.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
