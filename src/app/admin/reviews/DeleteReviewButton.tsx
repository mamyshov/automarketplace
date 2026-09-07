"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteReview } from "@/lib/actions/reviews";

export function DeleteReviewButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Удалить отзыв?")) return;
        startTransition(async () => {
          await deleteReview(id);
          router.refresh();
        });
      }}
      className="text-sm font-medium text-danger hover:underline disabled:opacity-60"
    >
      Удалить
    </button>
  );
}
