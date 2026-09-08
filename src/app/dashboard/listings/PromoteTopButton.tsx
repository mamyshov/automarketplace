"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestPlanUpgrade } from "@/lib/actions/subscriptions";

export function PromoteTopButton({
  listingId,
  isTop,
  isPendingRequest,
}: {
  listingId: string;
  isTop: boolean;
  isPendingRequest: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  if (isTop) {
    return <span className="text-xs font-semibold uppercase text-warning">TOP</span>;
  }
  if (isPendingRequest || sent) {
    return <span className="text-xs text-neutral-400">Заявка на TOP отправлена</span>;
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const res = await requestPlanUpgrade("top", listingId);
          if (res.ok) {
            setSent(true);
            router.refresh();
          } else if (res.error) {
            alert(res.error);
          }
        })
      }
      className="min-h-touch rounded-lg border border-warning px-3 py-1.5 text-sm font-medium text-warning hover:bg-warning/10 disabled:opacity-60"
    >
      {isPending ? "Отправляем…" : "Продвинуть в TOP"}
    </button>
  );
}
