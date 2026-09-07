"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { moderateListing } from "@/lib/actions/admin";
import type { ModerationStatus } from "@/types/database";

export function ModerationActions({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function moderate(status: ModerationStatus) {
    startTransition(async () => {
      await moderateListing(listingId, status);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        disabled={isPending}
        onClick={() => moderate("approved")}
        className="min-h-touch rounded-lg bg-success px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        Одобрить
      </button>
      <button
        disabled={isPending}
        onClick={() => moderate("rejected")}
        className="min-h-touch rounded-lg bg-danger px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        Отклонить
      </button>
    </div>
  );
}
