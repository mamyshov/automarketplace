import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ListingForm } from "../../ListingForm";
import { PhotoUploader } from "../PhotoUploader";
import type { ListingRow, ListingPhotoRow } from "@/types/database";

export const metadata: Metadata = { title: "Редактирование объявления" };

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("listings")
    .select("*, listing_photos(*)")
    .eq("id", params.id)
    .maybeSingle();

  if (!data) notFound();

  const listing = data as ListingRow & { listing_photos: ListingPhotoRow[] };
  const photos = [...listing.listing_photos]
    .sort((a, b) => a.position - b.position)
    .map((p) => ({ id: p.id, url: p.url }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-4 text-xl font-bold text-neutral-900">Фото объявления</h1>
        <PhotoUploader listingId={listing.id} initialPhotos={photos} />
      </div>

      <div>
        <h1 className="mb-4 text-xl font-bold text-neutral-900">Редактировать объявление</h1>
        <ListingForm
          mode="edit"
          listingId={listing.id}
          initial={{
            market: listing.market,
            brand: listing.brand,
            model: listing.model,
            year: listing.year,
            mileage: listing.mileage,
            body_type: listing.body_type,
            transmission: listing.transmission,
            fuel: listing.fuel,
            engine_volume: listing.engine_volume,
            color: listing.color,
            vin: listing.vin,
            price_origin: listing.price_origin,
            price_final: listing.price_final,
            status: listing.status,
            description: listing.description,
            location: listing.location,
          }}
        />
      </div>
    </div>
  );
}
