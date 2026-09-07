import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { formatMileage } from "@/lib/format";
import { CheckBadgeIcon } from "@/components/icons";
import type { ListingRow } from "@/types/database";

export interface ListingCardData
  extends Pick<
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
    | "location"
  > {
  photo_url: string | null;
}

export function ListingCard({ listing }: { listing: ListingCardData }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        {listing.photo_url ? (
          <Image
            src={listing.photo_url}
            alt={`${listing.brand} ${listing.model}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-neutral-300">🚗</div>
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          <StatusBadge status={listing.status} className="bg-white/95" />
        </div>
        <div className="absolute right-2 top-2 flex flex-col items-end gap-1.5">
          <FavoriteButton listingId={listing.id} />
          {listing.is_verified && (
            <div className="flex items-center gap-1 rounded-full bg-success/95 px-2 py-1 text-xs font-medium text-white">
              <CheckBadgeIcon width={14} height={14} />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="font-semibold text-neutral-900">
          {listing.brand} {listing.model}, {listing.year}
        </div>
        <div className="text-sm text-neutral-500">
          {formatMileage(listing.mileage)}
          {listing.location ? ` · ${listing.location}` : ""}
        </div>

        <div className="mt-auto pt-2">
          {listing.market === "china" && listing.price_origin ? (
            <div className="text-xs text-neutral-500">
              В Китае от ${new Intl.NumberFormat("en-US").format(listing.price_origin)}
            </div>
          ) : null}
          <div className="text-lg font-bold text-neutral-900">
            ${new Intl.NumberFormat("en-US").format(listing.price_final)}
          </div>
        </div>
      </div>
    </Link>
  );
}
