"use client";

import { useEffect, useState } from "react";
import { isFavorite, toggleFavorite } from "@/lib/favorites";
import { HeartIcon } from "@/components/icons";

export function FavoriteButton({ listingId, className = "" }: { listingId: string; className?: string }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isFavorite(listingId));
  }, [listingId]);

  return (
    <button
      type="button"
      aria-label={active ? "Убрать из избранного" : "Добавить в избранное"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setActive(toggleFavorite(listingId).includes(listingId));
      }}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition ${
        active ? "text-accent-500" : "text-neutral-400"
      } ${className}`}
    >
      <HeartIcon width={18} height={18} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
