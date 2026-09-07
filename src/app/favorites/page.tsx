"use client";

import { useEffect, useState } from "react";
import { getFavoriteIds } from "@/lib/favorites";
import { getListingsByIds } from "@/lib/actions/favorites";
import { ListingCard, type ListingCardData } from "@/components/ui/ListingCard";

export default function FavoritesPage() {
  const [listings, setListings] = useState<ListingCardData[] | null>(null);

  useEffect(() => {
    getListingsByIds(getFavoriteIds()).then(setListings);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="mb-4 text-2xl font-bold text-neutral-900">Избранное</h1>

      {listings === null ? (
        <p className="text-neutral-500">Загрузка…</p>
      ) : listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          Вы ещё не добавили объявления в избранное — нажмите на ♡ на карточке автомобиля.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
