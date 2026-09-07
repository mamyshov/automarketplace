"use client";

import { useState, useTransition } from "react";
import { updateListingStatus } from "@/lib/actions/listings";
import { STATUS_LABELS } from "@/lib/constants";
import type { ListingStatus } from "@/types/database";

export function StatusSelect({ listingId, initialStatus }: { listingId: string; initialStatus: ListingStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as ListingStatus;
        setStatus(next);
        startTransition(() => {
          updateListingStatus(listingId, next);
        });
      }}
      className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm disabled:opacity-60"
    >
      {Object.entries(STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  );
}
