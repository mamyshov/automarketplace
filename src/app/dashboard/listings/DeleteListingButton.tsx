"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteListing } from "@/lib/actions/listings";

export function DeleteListingButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Удалить объявление? Это действие необратимо.")) return;
        startTransition(async () => {
          await deleteListing(listingId);
          router.refresh();
        });
      }}
      className="text-sm font-medium text-danger hover:underline disabled:opacity-60"
    >
      Удалить
    </button>
  );
}
