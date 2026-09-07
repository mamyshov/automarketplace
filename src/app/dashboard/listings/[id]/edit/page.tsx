import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ListingForm } from "../../ListingForm";
import { PhotoUploader } from "../PhotoUploader";
import { getOwnDealer } from "@/lib/data/dealers";
import { getBrandsWithModels } from "@/lib/data/brands";
import type { ListingRow, ListingPhotoRow } from "@/types/database";

export const metadata: Metadata = { title: "Редактирование объявления" };

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const [{ data }, dealer, brands] = await Promise.all([
    supabase.from("listings").select("*, listing_photos(*)").eq("id", params.id).maybeSingle(),
    getOwnDealer(),
    getBrandsWithModels(),
  ]);
  const brandCatalog = brands.map((b) => ({ name: b.name, models: b.models.map((m) => m.name) }));

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
          ownDealer={dealer ? { id: dealer.id, name: dealer.name } : null}
          brandCatalog={brandCatalog}
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
            dealer_id: listing.dealer_id,
          }}
        />
      </div>
    </div>
  );
}
