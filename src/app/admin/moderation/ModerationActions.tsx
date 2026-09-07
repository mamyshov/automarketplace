"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { moderateListing, setListingVerified } from "@/lib/actions/admin";
import type { ModerationStatus } from "@/types/database";

export function ModerationActions({ listingId, isVerified }: { listingId: string; isVerified: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(fn: () => Promise<unknown>) {
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  }

  function moderate(status: ModerationStatus) {
    run(() => moderateListing(listingId, status));
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
      <button
        disabled={isPending}
        onClick={() => run(() => setListingVerified(listingId, !isVerified))}
        className="min-h-touch rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 disabled:opacity-60"
      >
        {isVerified ? "Снять проверку" : "✅ Проверено"}
      </button>
    </div>
  );
}
